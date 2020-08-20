

namespace WorkletProtocol {
  export namespace Host {
    export enum Type {
      Push,
      Remaining
    }

    export interface Push {
      type: Type.Push;
      buffer: Int16Array;
    }

    export interface Remaining {
      type: Type.Remaining;
      id: number;
    }

    export type Message = Push | Remaining;

    export const push = (buffer: Int16Array): Push => ({
      type: Type.Push,
      buffer
    });

    export const remaining = (id: number): Remaining => ({
      type: Type.Remaining,
      id
    });

    
  }

  export namespace Worklet {
    export enum Type {
      Remaining,
      Log
    }

    export interface Remaining {
      type: Type.Remaining;
      id: number;
      samples: number;
    }

    export interface Log {
      type: Type.Log;
      message: string;
    }

    export type Message = Remaining | Log;

    export const remaining = (id: number, samples: number): Remaining => ({
      type: Type.Remaining,
      id,
      samples
    });

    export const log = (message: string): Log => ({
      type: Type.Log,
      message
    });
  }
}

export default WorkletProtocol;