export default class GURPSRoll {
  roll = 'ST';

  async rollAgainstAttractor(actor: Actor, minus = 0): Promise<any> {
    const roll = minus < 0 ? `[ST${minus}]` : `[ST+${minus}]`;
    return GURPS.executeOTF(roll, false, null, actor);
  }
}
