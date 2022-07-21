const MODULE_NAME = 'token-attractor';
const TEMPLATES_FOLDER = `modules/${MODULE_NAME}/templates`;

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
async function registerPartials() {
    Handlebars.registerPartial('choiceTable', await getTemplate(`${TEMPLATES_FOLDER}/partials/choiceTable.hbs`));
}

function registerHooks() {
    // Initialize module
    Hooks.once('init', async () => {
        console.log('token-attractor | Initializing token-attractor');
        // Register custom module settings
        registerSettings();
        // register Handlebars helpers and partials
        registerHelpers();
        await registerPartials();
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
