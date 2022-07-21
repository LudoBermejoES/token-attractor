interface EncumbranceLevel {
  key: string;
  level: number;
  dodge: number;
  weight: number;
  move: number;
  currentdodge: number;
  currentflight: number;
  currentmove: number;
  currentmovedisplay: number;
}
interface RecourceTracker {
  name: string;
  value: number;
  min: number;
  max: number;
  points: number;
}
interface HitLocation {
  import: string;
  dr: string;
  equipment: string;
  penalty: string;
  roll: string;
  where: string;
}
interface Attribute {
  dr: number;
  import: number;
  value: number;
  points: number;
  dtype: 'Number';
}
interface BaseSkill {
  name: string;
  notes: string;
  pageref: string;
  contains: Record<string, never>;
  points: number;
  import: string;
  uuid: string;
  level: number;
}
interface Skill extends BaseSkill {
  type: string;
  relativelevel: string;
  parentuuid: string;
}
interface Spell extends BaseSkill {
  class: string;
  college: string;
  cost: string;
  maintain: string;
  duration: string;
  resist: string;
  casttime: string;
  difficulty: string;
  parentuuid: string;
}

export interface ReadyManeouverNeeded {
  itemId: string;
  remainingRounds: number;
  remainingShots: number;
}

export interface Attack {
  name: string;
  contains: Record<string, never>;
  notes: string;
  otf: string;
  pageref: string;
  itemid: string;
  import: string;
  damage: string;
  st: string;
  mode: string;
  level: number;
}
export interface MeleeAttack extends Attack {
  weight: string;
  techlevel: string;
  cost: string;
  reach: string;
  parry: string;
  block: string;
  notes: string;
}
export interface RangedAttack extends Attack {
  acc: string;
  ammo: string;
  bulk: string;
  legalityclass: string;
  range: string;
  rcl: string;
  rof: string;
  shots: string;
}
interface Advantage {
  name: string;
  notes: string;
  pageref: string;
  contains: Record<string, Advantage>;
  points: number;
  userdesc: string;
  note: string;
  uuid: string;
  parentuuid: string;
}
interface Reaction {
  modifier: string;
  situation: string;
}
interface Note {
  notes: string;
  pageref: string;
  contains: Record<string, never>;
  uuid: string;
  parentuuid: string;
}
interface Item {
  itemid: string;
  name: string;
  notes: string;
  pageref: string;
  contains: Record<string, Item>;
  equipped: boolean;
  carried: boolean;
  count: number;
  cost: number;
  weight: number;
  location: string;
  techlevel: string;
  legalityclass: string;
  categories: string;
  costsum: number;
  weightsum: number;
  uses: string;
  maxuses: string;
  ignoreImportQty: boolean;
  uuid: string;
  parentuuid: string;
  collapsed: Record<string, never>;
}
// the way Actor.data.data looks
interface ActorDataPropertiesData {
  attributes: {
    ST: Attribute;
    DX: Attribute;
    IQ: Attribute;
    HT: Attribute;
    WILL: Attribute;
    PER: Attribute;
  };
  HP: {
    value: number;
    min: number;
    max: number;
    points: number;
  };
  FP: {
    value: number;
    min: number;
    max: number;
    points: number;
  };
  dodge: {
    value: number;
    enc_level: number;
  };
  basicmove: {
    value: string;
    points: number;
  };
  basicspeed: {
    value: string;
    points: number;
  };
  parry: number;
  currentmove: number;
  thrust: string;
  swing: string;
  frightcheck: number;
  hearing: number;
  tastesmell: number;
  vision: number;
  touch: number;
  languages: Record<string, never>;
  money: Record<string, never>;
  totalpoints: {
    attributes: number;
    ads: number;
    disads: number;
    quirks: number;
    skills: number;
    spells: number;
    total: number;
    unspent: number;
    race: number;
  };
  liftingmoving: {
    basiclift: string;
    carryonback: string;
    onehandedlift: string;
    runningshove: string;
    shiftslightly: string;
    shove: string;
    twohandedelift: string;
    twohandedlift: string;
  };
  additionalresources: {
    bodyplan: string;
    tracker: Record<string, RecourceTracker>;
    importname: string;
    importversion: string;
    importpath: string;
  };
  conditions: {
    maneuver: string;
  };
  conditionalinjury: {
    RT: {
      value: number;
      points: number;
    };
    injury: {
      severity: string;
      daystoheal: number;
    };
  };
  migrationversion: string;
  lastImport: string;
  currentdodge: number;
  skills: Record<string, Skill>;
  traits: {
    race: string;
    height: string;
    weight: string;
    age: string;
    title: string;
    player: string;
    createdon: string;
    modifiedon: string;
    religion: string;
    birthday: string;
    hand: string;
    sizemod: string;
    techlevel: string;
    appearance: string;
    gender: string;
    eyes: string;
    hair: string;
    skin: string;
  };
  melee: Record<string, MeleeAttack>;
  ranged: Record<string, RangedAttack>;
  spells: Record<string, Spell>;
  ads: Record<string, Advantage>;
  reactions: Record<string, Reaction>;
  encumbrance: Record<string, EncumbranceLevel>;
  notes: Record<string, Note>;
  equipment: {
    carried: Record<string, Item>;
    other: Record<string, Item>;
  };
  hitlocations: Record<string, HitLocation>;
  currentflight: number;
  equippedparry: number;
  equippedblock: number;
  eqtsummary: {
    eqtcost: number;
    eqtlbs: number;
    othercost: number;
  };
}
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

//#region registering
interface ActorDataProperties {
  type: 'character';
  data: ActorDataPropertiesData;
}
export interface Modifier {
  mod: number;
  desc: string;
}
interface ModifierBucket {
  addModifier(mod: number, reason: string): void;
}
declare global {
  interface Actor {
    replaceManeuver: (maneuver?: string) => Promise<void>;
  }
  interface Token {
    setManeuver: (maneuver?: string) => Promise<void>;
  }
  interface DataConfig {
    Actor: ActorDataProperties;
  }
  const GURPS: {
    LastActor: Actor;
    rangeObject: any;
    SetLastActor(actor: Actor): void;
    gurpslink(otf: string): string;
    executeOTF(otf: string, priv: boolean | false, event: Event | null, actor: Actor | undefined): boolean;
    performAction(
      data: {
        type: string;
        orig: string;
        isSpellOnly: boolean;
        isSkillOnly: boolean;
        name: string;
        spantext: string;
      },
      actor: Actor,
    ): Promise<boolean>;
    performAction(
      data: {
        type: 'damage' | 'deriveddamage';
        derivedformula: string;
        formula: string;
        damagetype: string;
        extdamagetype: string;
      },
      actor: Actor,
    ): Promise<boolean>;
    performAction(
      data: {
        type: 'attack';
        isMelee: boolean;
        isRanged: boolean;
        name: string;
      },
      actor: Actor,
    ): Promise<boolean>;
    performAction(
      data: {
        orig: 'Dodge';
        path: 'currentdodge';
        type: 'attribute';
      },
      actor: Actor,
    ): Promise<boolean>;
    performAction(
      data: {
        isMelee: true;
        name: string;
        type: 'weapon-block';
      },
      actor: Actor,
    ): Promise<boolean>;
    performAction(
      data: {
        isMelee: true;
        name: string;
        type: 'weapon-parry';
      },
      actor: Actor,
    ): Promise<boolean>;
    lastTargetedRoll: GurpsRoll;
    ModifierBucket: ModifierBucket;
  };
}
//#endregion
type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType extends readonly (infer ElementType)[]
  ? ElementType
  : never;
interface ChooserData<T extends string[]> {
  items: Record<ArrayElement<T>, string | number>[];
  headers: T;
  id: string;
}

interface PromiseFunctions<T> {
  resolve(value: T | PromiseLike<T>): void;
  reject(reason: string): void;
}

interface Posture {
  name: string;
  tname: string;
}
