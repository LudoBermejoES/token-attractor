import System from './system';

export default class Roller {
  async callForRoll(combatantId: string | undefined, modifier: number): Promise<any> {
    const system: System = new System();
    if (!system.getSystemEnabled) return false;

    return new Promise((resolve, reject) => {
      const d: Dialog = new Dialog({
        title: game.i18n.localize('tokenAttractor.callForRoll.dialogTitle'),
        content: `<p>${game.i18n.localize('tokenAttractor.callForRoll.dialogTitle')}</p>`,
        buttons: {
          roll: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize('tokenAttractor.callForRoll.dialogButton'),
            callback: async () => {
              const combatant: Combatant | undefined = game.combat?.combatants?.find(
                (combatant: Combatant) => combatant.id === combatantId,
              );
              if (combatant && combatant.actor) {
                const result = await system.rollAgainstAttractor(combatant.actor, modifier);
                resolve(result);
              }
            },
          },
        },
        render: (html) => console.log('Register interactivity in the rendered dialog'),
        close: (html) => console.log('This always is logged no matter which option is chosen'),
      });
      d.render(true);
    });
  }
}
