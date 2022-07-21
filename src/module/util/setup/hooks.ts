import { registerSettings } from './settings.js';
import { registerHelpers } from './handlebars.js';
import { MODULE_NAME } from '../constants.js';

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
  <label>${game.i18n.localize('patrol.tokenConfig.enablePatrol.name')}</label>
  <input type="checkbox" name="flags.${MODULE_NAME}.isAttractor" data-dtype="Boolean">
</div>
<div class="form-group">
  <label>${game.i18n.localize('patrol.tokenConfig.enableSpotting.name')}</label>
  <input type="checkbox" name="flags.${MODULE_NAME}.enableSpotting" data-dtype="Boolean">
</div>
<div class="form-group">
  <label>${game.i18n.localize('patrol.tokenConfig.makePatroller.name')}</label>
  <input type="checkbox" name="flags.${MODULE_NAME}.makePatroller" data-dtype="Boolean">
  <label>${game.i18n.localize('patrol.tokenConfig.multiPath.name')}</label>
  <input type="checkbox" name="flags.${MODULE_NAME}.multiPath" data-dtype="Boolean">
</div>
<div class="form-group">
  <label>${game.i18n.localize('patrol.tokenConfig.patrolPathName.name')}</label>
  <input type="text" name="flags.${MODULE_NAME}.patrolPathName" value="">
  <label> ${game.i18n.localize('patrol.tokenConfig.pathNodeIndex.name')} </label>
  <input type="text" name="flags.${MODULE_NAME}.pathNodeIndex" value="">
</div>
`;
    const lockrotation = html.find("input[name='lockRotation']");
    const formGroup = lockrotation.closest('.form-group');
    formGroup.after(toggleHTML);
    html.find(`input[name ='flags.${MODULE_NAME}.enablePatrol']`)[0].checked =
      app.token.getFlag(MODULE_NAME, 'enablePatrol') || false;
    html.find(`input[name ='flags.${MODULE_NAME}.enableSpotting']`)[0].checked =
      app.token.getFlag(MODULE_NAME, 'enableSpotting') || false;
    html.find(`input[name ='flags.${MODULE_NAME}.makePatroller']`)[0].checked =
      app.token.getFlag(MODULE_NAME, 'makePatroller') || false;
    html.find(`input[name ='flags.${MODULE_NAME}.multiPath']`)[0].checked =
      app.token.getFlag(MODULE_NAME, 'multiPath') || false;
    html.find(`input[name = 'flags.${MODULE_NAME}.patrolPathName']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'patrolPathName') || '';
    html.find(`input[name = 'flags.${MODULE_NAME}.pathNodeIndex']`)[0].value =
      app.token.getFlag(MODULE_NAME, 'pathNodeIndex') || 0;
  });
}
