import WorkletProtocol from "./worklet_protocol";

export interface BufferedAudio {
  // Initialize the buffered audio. Returns
  // a callback to begin playback (if applicable).
  initialize(): Promise<() => void>;

  // Gets the number of samples left in the internal buffer.
  // This needs to be async for worklets, as we actually have to
  // make a call into the audio thread and receive a reply.
  remaining: () => Promise<number>;

  // The underlying audio node
  node: AudioNode;

  // Append new data to this buffered audio source
  push: (data: Int16Array) => void;
}

// Represents a promise that has not yet been completed
interface ResolveReject<T = any> {
  resolve: (t: T) => void;
  reject: (err: any) => void;
}

// Uses AudioWorklets for playback. This is preferred, and should lead to higher performance.
// Safari and some older browser's don't support it, though.
class WorkletBufferedAudio implements BufferedAudio {
  private context_: AudioContext;
  private node_: AudioWorkletNode;

  private idIter_ = 0;
  private outstandingRequests_: { [id: number]: ResolveReject } = {};

  constructor(context: AudioContext) {
    this.context_ = context;
  }

  remaining() {
    return new Promise<number>((resolve, reject) => {
      // Get a new id for this RPC call
      ++this.idIter_;

      // We'll handle this promise in the `onMessage_` handler.
      this.outstandingRequests_[this.idIter_] = {
        resolve,
        reject,
      };

      this.node_.port.postMessage(WorkletProtocol.Host.remaining(this.idIter_));
    });
  }

  // Message handler for messages received from the worklet
  private onMessage_ = (event: MessageEvent) => {
    const message: WorkletProtocol.Worklet.Message = event.data;
    switch (message.type) {
      case WorkletProtocol.Worklet.Type.Remaining: {
        // We got a reply with an request id that wasn't in our `outstandingRequests_`.
        // This should be impossible
        if (!(message.id in this.outstandingRequests_)) {
          debugger;
        }

        // Resolve the outstanding promise, and delete the outstandingRequest_ of the given `id`
        this.outstandingRequests_[message.id].resolve(message.samples);
        delete this.outstandingRequests_[message.id];

        break;
      }
      case WorkletProtocol.Worklet.Type.Log: {
        // This message type allows the worklet to use console.log for debugging purposes
        console.log("worklet:", message.message);
      }
    }
  };

  async initialize() {
    await this.context_.audioWorklet.addModule("worklet.js");
    this.node_ = new AudioWorkletNode(this.context_, "buffered-processor");

    this.node_.port.onmessage = this.onMessage_;

    return () => {};
  }

  get node() {
    return this.node_;
  }

  push(data: Int16Array) {
    this.node_.port.postMessage(WorkletProtocol.Host.push(data));
  }
}

// Used in Safari and older browsers. Executes on the main JS thread.
class ScriptBufferedAudio implements BufferedAudio {
  private context_: AudioContext;
  private node_: ScriptProcessorNode;

  private buffers_: Int16Array[] = [];
  private index_ = 0;
  private currentBuffer_: Int16Array;

  constructor(context: AudioContext) {
    this.context_ = context;
  }

  remaining() {
    let remaining = 0;
    for (let i = 0; i < this.buffers_.length; ++i) {
      remaining += this.buffers_[i].length;
    }
    if (this.currentBuffer_)
      remaining += this.currentBuffer_.length - this.index_;
    return Promise.resolve(remaining);
  }

  private onAudioProcess_ = (ev: AudioProcessingEvent) => {
    const output: Float32Array[] = [];

    for (let i = 0; i < ev.outputBuffer.numberOfChannels; ++i) {
      output.push(ev.outputBuffer.getChannelData(0));
    }

    const size = output[0].length;
    let i = 0;
    let last = 0;
    for (; i < size; ++i) {
      if (!this.currentBuffer_ || this.index_ >= this.currentBuffer_.length) {
        this.currentBuffer_ = this.buffers_.shift();
        this.index_ = 0;
      }

      if (!this.currentBuffer_) break;

      for (let c = 0; c < output.length; ++c) {
        last = output[c][i] = this.currentBuffer_[this.index_] / 32767;
      }

      ++this.index_;
    }

    // If we're out of buffered data but we still need to write samples,
    // write out the last sample we saw.
    for (; i < size; ++i) {
      for (let c = 0; c < output.length; ++c) {
        output[c][i] = last;
      }
    }
  };

  // This must be called directly from an event handler. It cannot be in an async block or callback
  initialize() {
    // We need a source to "feed" our script processor, as the script processor
    // only transforms an existing source (it cannot be a source itself).

    // The most reasonable choice for a source is a ConstantSource. Unfortunately,
    // ConstantSources are not supported in Safari. Sigh.
    const source = this.context_.createOscillator();

    // Wire up our nodes
    this.node_ = this.context_.createScriptProcessor(4096, 1, 1);
    this.node_.onaudioprocess = this.onAudioProcess_;
    source.connect(this.node_);

    // (for Safari, set the oscillator type to sine)
    (source as any).type = 0;

    // After the remaining (external) initialization completes,
    // the callee can use this to begin playback.
    return Promise.resolve(() => source.start());
  }

  get node() {
    return this.node_;
  }

  push(data: Int16Array) {
    this.buffers_.push(data);
  }
}

// If AudioWorklets are supported on this browser, use worklets. Otherwise, use the deprecated ScriptProcessorNode API.
export default (context: AudioContext): BufferedAudio =>
  !!context.audioWorklet
    ? new WorkletBufferedAudio(context)
    : new ScriptBufferedAudio(context);
