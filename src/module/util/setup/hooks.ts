import { registerSettings } from './settings.js';
import { registerHelpers } from './handlebars.js';
import { MODULE_NAME } from '../constants.js';
import Attractor from '../../scripts/attractor';
import { registerFunctions } from './socketkib';
import highestPriorityUsers from '../priorities';

let attractor: Attractor;

export function registerHooks(): void {
  // Initialize module
  Hooks.once('init', async () => {
    console.log('token-attractor | Initializing token-attractor');

    // Register custom module settings
    registerSettings();

    // register Handlebars helpers and partials
    registerHelpers();
  });

  Hooks.on('renderTokenConfig', (app: any, html: any, data: any) => {
    if (!game?.user?.isGM) return;
    const toggleHTML = `<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.isAttractor')}</label>
  <input type="checkbox" name="flags.${MODULE_NAME}.isAttractor" data-dtype="Boolean">
</div>
<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.distanceAttraction')}</label>
  <input type="text" name="flags.${MODULE_NAME}.distanceAttraction" data-dtype="">
</div>
<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.maxForceAttraction')}</label>
  <input type="text" name="flags.${MODULE_NAME}.maxForceAttraction" data-dtype="">
</div>
<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.maxModifier')}</label>
  <input type="text" name="flags.${MODULE_NAME}.maxModifier" data-dtype="">
</div>

<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.minForceAttraction')}</label>
  <input type="text" name="flags.${MODULE_NAME}.minForceAttraction" data-dtype="">
</div>
<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.minModifier')}</label>
  <input type="text" name="flags.${MODULE_NAME}.minModifier" data-dtype="">
</div>

<div class="form-group">
  <label>${game.i18n.localize('tokenAttractor.settings.isAttracted')}</label>
  <input type="checkbox" name="flags.${MODULE_NAME}.isAttracted" data-dtype="boolean">
</div>

`;
    const lockrotation = html.find("input[name='lockRotation']");
    const formGroup = lockrotation.closest('.form-group');
    formGroup.after(toggleHTML);
    html.find(`input[name ='flags.${MODULE_NAME}.isAttractor']`)[0].checked =
      app.token.getFlag(MODULE_NAME, 'isAttractor') || false;
    html.find(`input[name = 'flags.${MODULE_NAME}.distanceAttraction']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'distanceAttraction') || '';
    html.find(`input[name ='flags.${MODULE_NAME}.isAttracted']`)[0].checked =
      app.token.getFlag(MODULE_NAME, 'isAttracted') || false;
    html.find(`input[name ='flags.${MODULE_NAME}.maxForceAttraction']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'maxForceAttraction') || '';
    html.find(`input[name ='flags.${MODULE_NAME}.minForceAttraction']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'minForceAttraction') || '';
    html.find(`input[name ='flags.${MODULE_NAME}.minModifier']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'minModifier') || '';
    html.find(`input[name ='flags.${MODULE_NAME}.maxModifier']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'maxModifier') || '';
  });

  Hooks.on('canvasReady', () => {
    if (!game?.user?.isGM) return;
    attractor = new Attractor();
  });

  Hooks.on('canvasReady', () => {
    if (!game?.user?.isGM) return;
    if (!attractor) attractor = new Attractor();
  });

  Hooks.on('deleteCombat', async (combat: Combat) => {
    attractor.createInterval();
  });

  Hooks.on('updateCombat', async (combat: Combat) => {
    const timeout = setTimeout(async () => {
      const combatant = combat?.combatant;
      if (!combatant?.token?.object) return;
      if (!attractor) attractor = new Attractor();
      const isTokenAttracted: Token[] | boolean = attractor.isTokenAttracted(combatant?.token?.object as Token);
      if (!isTokenAttracted) return;
      if (!combatant?.actor) return;
      const users = highestPriorityUsers(combatant.actor);
      if (!users.length) return;
      const combatantId: string | undefined = combatant?.id || undefined;

      for (const attractorToken of isTokenAttracted) {
        const modifier = attractor.getModifier(combatant?.token?.object as Token, attractorToken);
        const result = await TokenAttractor.socket.executeAsUser(
          'callForRoll',
          users[0]?.id || '',
          combatantId,
          modifier,
        );
        if (!result) {
          console.log('HE FALLADO');
          attractor.attractCompute(combat?.combatant);
        } else {
          const margin: number = GURPS.lastTargetedRoll.margin;

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const currentMove = combatant?.actor?.data?.data?.currentmove || 6;
          const restOfMovement = Math.min(margin, currentMove);
          const round = game.combat?.round ?? 0;
          debugger;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          window?.EasyCombat?.socket?.executeAsUser('addStoredMovement', users[0]?.id, restOfMovement, round);
        }
        clearTimeout(timeout);
      }
    }, 1000);
  });

  Hooks.once('socketlib.ready', registerFunctions);
}
