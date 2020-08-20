import audioEngine, {
  source_new,
  source_free,
  context_free,
  context_new,
  dimension_free,
  dimension_new,
  engine_next,
  engine_free,
  engine_new,
  loop_free,
  loop_new,
  oneshot_free,
  oneshot_new,
  test
} from "./audio_engine.js";

import { BufferedAudio } from './buffered_audio';
import { Manifest } from './manifest';

const create_source = (name: string, buffer: AudioBuffer) => {
  const samples_f32 = buffer.getChannelData(0);
  
  // The audio engine currently only accepts S16 PCM.
  // Converts the F32 to S16.
  const samples_i16 = new Int16Array(samples_f32.length);
  for (let i = 0; i < samples_f32.length; ++i) {
    samples_i16[i] = Math.floor(samples_f32[i] * 32768);
  }

  const ret = source_new(name, samples_i16);
  return ret;
}

const create_loop = (loop: Manifest.Loop<AudioBuffer>) => {
  let source = create_source("Unknown", loop.source);
  const ret = loop_new(loop.peak, source, loop.gain);
  return ret;
}

const create_oneshot = (oneshot: Manifest.OneShot<AudioBuffer>) => {
  return oneshot_new(oneshot.threshold, oneshot.mode, create_source("Unknown", oneshot.source), oneshot.gain);
}

const create_dimension = (name: string, dimension: Manifest.Dimension<AudioBuffer>) => {
  const loops = new Uint32Array(dimension.loops.map(loop => create_loop(loop)));
  const oneshots = new Uint32Array(dimension.oneshots.map(loop => create_oneshot(loop)));
  return dimension_new(name, loops, oneshots);
}

const create_context = (manifest: Manifest.Context<AudioBuffer>): number => {
  let dimensions = manifest.ordering.map(key => create_dimension(key, manifest.dimensions[key]));
  return context_new(new Uint32Array(dimensions));
}

const create_engine = (context: number, sampleRate: number) => {
  return engine_new(context, sampleRate);
}

// Wires the audio engine to a bufferedAudio node and initializes the engine. Returns a callback for
// manipulating the engine's state.
// This should probably be moved into a WebWorker one day, as `engine_next` is an expensive operation.
export default async (context: AudioContext, bufferedAudio: BufferedAudio, manifest: any) => {
  await audioEngine('/static/audio_engine_bg.wasm');

  let engineContext = create_context(manifest);
  const handle = create_engine(engineContext, context.sampleRate);

  // Represents the current value of every dimension. 32 is arbitrary.
  const local_state = new Float32Array(32);

  // `generate` attempts to maintain an audio buffer of `targetSamples` length.
  // It is frequently called. `targetSamples` is adjusted as needed depending
  // on the device's performance
  let targetSamples = Math.floor(context.sampleRate / 5);
  let guard = 0;
  const generate = async () => {
    const samples = await bufferedAudio.remaining();

    // The time it takes for targetSamples to be played in ms
    const trueInterval = targetSamples / context.sampleRate * 1000;

    // No work to be done, reschedule generate.
    if (samples >= targetSamples) {
      setTimeout(generate, trueInterval / 4);
      return;
    }

    // How many samples do we need to generate to replenish the audio buffer?
    const diff = targetSamples - samples;

    // The guard gives the browser some time to JIT us
    if (++guard > 10) {
      if (diff < targetSamples / 4) {
        // If we are significantly ahead of the deadline, decrease our targetSamples (to a min of 100ms).
        targetSamples = Math.max(context.sampleRate / 10, targetSamples / 2);
      } else if (samples < targetSamples * 0.3) {
        // We cut it too close to the deadline. Increase our targetSamples (to a max of 2000ms)
        targetSamples = Math.min(context.sampleRate * 2, targetSamples * 2);
      }
    }
    
    // Generate `diff` samples of audio from the engine, and push the new buffer into the queue
    const next = new Int16Array(diff);
    engine_next(handle, local_state, next);
    bufferedAudio.push(next);

    setTimeout(generate, trueInterval / 4);
  };

  generate();

  // This callback allows the callee to update the engine state
  return (state: { [name: string]: number }) => {
    for (let i = 0; i < manifest.ordering.length; ++i) {
      local_state[i] = state[manifest.ordering[i]];
    }
  };
}
