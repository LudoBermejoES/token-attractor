export interface GurpsRoll {
  chatthing: string;
  failure: boolean;
  finaltarget: number;
  isCritFailure: boolean;
  isCritSuccess: boolean;
  isDraggable: boolean;
  loaded: boolean;
  margin: number;
  modifier: number;
  optlabel: string;
  origtarget: number;
  otf: string;
  prefix: string;
  rolls: string;
  rtotal: number;
  seventeen: boolean;
  rofrcl: number;
  targetmods: {
    desc: string;
    mod: string;
    modint: number;
    plus: boolean;
  }[];
  thing: string;
}

declare global {
  const GURPS: {
    gurpslink(otf: string): string;
    executeOTF(otf: string, priv: boolean | false, event: Event | null, actor: Actor | undefined): boolean;
    lastTargetedRoll: GurpsRoll;
  };
}

interface PromiseFunctions<T> {
  resolve(value: T | PromiseLike<T>): void;
  reject(reason: string): void;
}
