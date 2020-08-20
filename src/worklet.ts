import WorkletProtocol from './worklet_protocol';

// TypeScript doesn't know about these builtin types currently. We define them.
interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

declare var AudioWorkletProcessor: {
  prototype: AudioWorkletProcessor;
  new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor;
};

declare function registerProcessor(
  name: string,
  processorCtor: (new (
    options?: AudioWorkletNodeOptions
  ) => AudioWorkletProcessor) & {
    parameterDescriptors?: AudioParamDescriptor[];
  }
);

// This audio worklet maintains an internal buffer of audio data
// and writes out audio as needed by the web browser's audio context.
class BufferedProcessor extends AudioWorkletProcessor {
  // Queued buffers that will eventually be played
  private buffers_: Int16Array[] = [];
  
  // The buffer we're currently "playing" from
  private currentBuffer_: Int16Array = null;
  
  // The offset into the `currentBuffer_`
  private index_ = 0;

  constructor(options?: AudioWorkletNodeOptions) {
    super(options);
    this.port.onmessage = this.onMessage_;
  }

  // Handles incoming messages from the main thread
  private onMessage_ = (event: MessageEvent) => {
    const message: WorkletProtocol.Host.Message = event.data;
    switch (message.type) {
      case WorkletProtocol.Host.Type.Push: {
        // We got new audio data. Push it back.
        this.buffers_.push(message.buffer);
        break;
      }
      case WorkletProtocol.Host.Type.Remaining: {
        // We got a request for the remaining samples in our internal buffer.
        let remaining = 0;
        
        for (let i = 0; i < this.buffers_.length; ++i) {
          remaining += this.buffers_[i].length;
        }

        if (this.currentBuffer_) remaining += this.currentBuffer_.length - this.index_;

        // Echo back the request `id` so the host can sort out which outstanding promise
        // to resolve.
        this.port.postMessage(WorkletProtocol.Worklet.remaining(message.id, remaining));
        break;
      }
    }
  };

  // Called by the browser to receive new samples from us
  process(inputs, outputs, parameters) {
    const output = outputs[0]
    const size = output[0].length;

    let i = 0;
    let last = 0;
    for (; i < size; ++i) {
      // Do we need a new `currentBuffer_`?
      if (!this.currentBuffer_ || this.index_ >= this.currentBuffer_.length) {
        this.currentBuffer_ = this.buffers_.shift();
        this.index_ = 0;
      }

      // If we still don't have a `currentBuffer_`, there is no data remaining.
      if (!this.currentBuffer_) break;

      // Write out the samples on all channels (forced mono) as F32.
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
    
    return true;
  }
}

// Register our worklet
registerProcessor('buffered-processor', BufferedProcessor);