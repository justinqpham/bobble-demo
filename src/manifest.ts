import env from './env';

// Safari doesn't support Opus. Fall back to MP3.
const media_ext = env.browser.safari ? 'mp3' : 'ogg';

// Helper that maps an object of Is to an object of Os
const mapObject = async <I, O>(obj: { [name: string]: I }, f: (i: I) => Promise<O>) => {
  const ret: { [name: string]: O } = {};

  const keys = Object.keys(obj);
  const values = await Promise.all(keys.map(key => f(obj[key])))

  for (let i = 0; i < keys.length; ++i) {
    const key = keys[i];
    ret[key] = values[i];
  }

  return ret;
}

// Represents a manifest with abstract data
export namespace Manifest {
  export interface Context<T> {
    ordering: string[];
    dimensions: { [name: string]: Dimension<T> };
  }

  export namespace Context {
    // Apply an asynchronous function `f` over all `sources` in the `context`.
    // We can transform our manifest using these methods. For example, given a manifest of
    // string (URI) sources, map those sources to `ArrayBuffer`s by `fetch`ing each URI.
    // This gives us asynchronous loading of all sources, and allows easy transforms of manifest.
    export const map = async <I, O>(context: Context<I>, f: (i: I) => Promise<O>) => ({
      ...context,
      dimensions: await mapObject(context.dimensions, dimension => Dimension.map(dimension, f))
    }) as Context<O>;
  }

  export interface Dimension<T> {
    loops: Loop<T>[];
    oneshots: OneShot<T>[];
  }

  export namespace Dimension {
    export const map = async <I, O>(dimension: Dimension<I>, f: (i: I) => Promise<O>) => ({
      ...dimension,
      loops: await Promise.all(dimension.loops.map(loop => Loop.map(loop, f))),
      oneshots: await Promise.all(dimension.oneshots.map(oneshot => OneShot.map(oneshot, f)))
    }) as Dimension<O>;
  }

  export interface Loop<T> {
    peak: number;
    gain: number;
    source: T;
  }

  export namespace Loop {
    export const map = async <I, O>(loop: Loop<I>, f: (i: I) => Promise<O>) => ({
      ...loop,
      source: await f(loop.source)
    }) as Loop<O>;

    export const replicate = <T>(peak: number, gain: number, sources: T[]): Loop<T>[] => sources.map(value => ({
      peak,
      gain,
      source: value
    }));
  }

  export interface OneShot<T> {
    threshold: number;
    mode: number;
    gain: number;
    source: T;
  }

  export namespace OneShot {
    export const map = async <I, O>(oneshot: OneShot<I>, f: (i: I) => Promise<O>) => ({
      ...oneshot,
      source: await f(oneshot.source)
    }) as OneShot<O>;

    export const replicate = <T>(threshold: number, mode: number, gain: number, sources: T[]): OneShot<T>[] => sources.map(value => ({
      threshold,
      mode,
      gain,
      source: value
    }));
  }
}

export default {
  ordering: [ 'A_Booing', 'A_Cheering', 'A_Clapping', 'A_LetDown', 'B_Booing', 'B_Cheering', 'B_Clapping', 'B_LetDown', 'Neutral' ],
  dimensions: {
    A_Booing: {
      loops: Manifest.Loop.replicate(1.0, 0.0, [
        `/audio/Booing/Loops/High/highBoo_infiniteLoop__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Booing/Loops/High/highBoo_infiniteLoop_2_normalized(-12.0db).wav.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, 0.0, [
        `/audio/Booing/Transitions/boo_Transition_2(punchy)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Booing/Transitions/boo_Transition_3(punchy)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Booing/Transitions/boo_Transition_4(punchy)__normalized(-12.00db).wav.${media_ext}`
      ])
    },
    A_Cheering: {
      loops: Manifest.Loop.replicate(1.0, 0.0, [
        `/audio/Cheering/Loops/High/Cheering_Long_2_DG_Edited__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Loops/High/Cheering_Long_4_DG_Edited__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Loops/High/Cheering_Short_10_DG_Edited__normalized(-12.00db).wav.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, 0.0, [
        `/audio/Cheering/Transitions/cheer_Transition_1__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_1(fadeOut)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_2__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_3__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_4__normalized(-12.00db).wav.${media_ext}`
      ])
    },
    A_Clapping: {
      loops: Manifest.Loop.replicate(1.0, -1.0, [
        `/audio/Clapping/Loops/High/newClap_1__normalized(-12.00db).wav.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, -1.0, [
        `/audio/Clapping/Transitions/clap_Transition_1__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_1(fadeOut)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_2__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_3__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_4__normalized(-12.00db).wav.${media_ext}`
      ])
    },
    A_LetDown: {
      loops: Manifest.Loop.replicate(1.0, 2.0, [
        `/audio/LetDown/Loops/High/drumsBanging-31secs.${media_ext}`,
        `/audio/LetDown/Loops/High/drumsBanging-37secs.${media_ext}`,
        `/audio/LetDown/Loops/High/drumsBanging-41secs.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, -1.0, [
        `/audio/LetDown/Transitions/trash-can-sound-5.${media_ext}`,
        `/audio/LetDown/Transitions/trash-can-sound-2edited.${media_ext}`
      ])
    },
    B_Booing: {
      loops: Manifest.Loop.replicate(1.0, 0.0, [
        `/audio/Booing/Loops/High/highBoo_infiniteLoop__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Booing/Loops/High/highBoo_infiniteLoop_2_normalized(-12.0db).wav.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, 0.0, [
        `/audio/Booing/Transitions/boo_Transition_2(punchy)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Booing/Transitions/boo_Transition_3(punchy)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Booing/Transitions/boo_Transition_4(punchy)__normalized(-12.00db).wav.${media_ext}`
      ])
    },
    B_Cheering: {
      loops: Manifest.Loop.replicate(1.0, 0.0, [
        `/audio/Cheering/Loops/High/Cheering_Long_2_DG_Edited__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Loops/High/Cheering_Long_4_DG_Edited__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Loops/High/Cheering_Short_10_DG_Edited__normalized(-12.00db).wav.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, 0.0, [
        `/audio/Cheering/Transitions/cheer_Transition_1__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_1(fadeOut)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_2__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_3__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Cheering/Transitions/cheer_Transition_4__normalized(-12.00db).wav.${media_ext}`
      ])
    },
    B_Clapping: {
      loops: Manifest.Loop.replicate(1.0, -1.0, [
        `/audio/Clapping/Loops/High/newClap_1__normalized(-12.00db).wav.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, -1.0, [
        `/audio/Clapping/Transitions/clap_Transition_1__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_1(fadeOut)__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_2__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_3__normalized(-12.00db).wav.${media_ext}`,
        `/audio/Clapping/Transitions/clap_Transition_4__normalized(-12.00db).wav.${media_ext}`
      ])
    },
    B_LetDown: {
      loops: Manifest.Loop.replicate(1.0, 2.0, [
        `/audio/LetDown/Loops/High/drumsBanging-31secs.${media_ext}`,
        `/audio/LetDown/Loops/High/drumsBanging-37secs.${media_ext}`,
        `/audio/LetDown/Loops/High/drumsBanging-41secs.${media_ext}`
      ]),
      oneshots: Manifest.OneShot.replicate(0.5, 0, -1.0, [
        `/audio/LetDown/Transitions/trash-can-sound-5.${media_ext}`,
        `/audio/LetDown/Transitions/trash-can-sound-2edited.${media_ext}`
      ])
    },
    Neutral: {
      loops: Manifest.Loop.replicate(1.0, -8.0, [
        `/audio/Neutral/Loops/High/wallaEdited-41secs.${media_ext}`,
        `/audio/Neutral/Loops/High/Walla-sounds-47-sec-edited.${media_ext}`
      ]),
      oneshots: []
    }
  }
};
