import GURPSRoll from './systems/gurps';

export default class System {
  getSystemEnabled(): boolean {
    const system = game.system.id.toUpperCase();
    if (system === 'GURPS') return true;
    return false;
  }

  async rollAgainstAttractor(actor: Actor, minus: number): Promise<any> {
    const system = game.system.id.toUpperCase();

    if (system === 'GURPS') {
      const roller: GURPSRoll = new GURPSRoll();
      return roller.rollAgainstAttractor(actor, minus);
    }
    return undefined;
  }
}
