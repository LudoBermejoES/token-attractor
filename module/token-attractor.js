const MODULE_NAME = 'token-attractor';

function registerSettings() {
    game.settings.register(MODULE_NAME, 'st-characteristic', {
        scope: 'world',
        type: String,
        default: 'data.ST.val',
        name: 'What characteristic we are looking for Strenght',
        hint: 'Streght value to check the amount of space the token will move',
        config: true,
    });
}

function registerHelpers() {
    Handlebars.registerHelper('gurpslink', GURPS.gurpslink);
    Handlebars.registerHelper('isEmptyString', (string) => string === '');
    Handlebars.registerHelper('get', (obj, prop) => obj[prop]);
    Handlebars.registerHelper('ifEquals', function (arg1, arg2, options) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
    });
}

function registerHooks() {
    // Initialize module
    Hooks.once('init', async () => {
        console.log('token-attractor | Initializing token-attractor');
        // Register custom module settings
        registerSettings();
        // register Handlebars helpers and partials
        registerHelpers();
    });
    Hooks.on('renderTokenConfig', (app, html, data) => {
        if (!game?.user?.isGM)
            return;
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

// Import TypeScript modules
let appId = '';
appId = '3';
const globals = {
    appId,
};
window.EasyCombat = globals;
registerHooks();
//# sourceMappingURL=token-attractor.js.map
