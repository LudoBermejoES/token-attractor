const MODULE_NAME = 'token-attractor';

function registerSettings() {
    game.settings.register(MODULE_NAME, 'only-in-combat', {
        scope: 'world',
        type: Boolean,
        default: true,
        name: 'Only attract in combat',
        hint: 'The vortex will only attract tokens when they are in combat mode',
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

class GURPSRoll {
    constructor() {
        this.roll = 'ST';
    }
    async rollAgainstAttractor(actor, minus = 0) {
        const roll = minus < 0 ? `[ST${minus}]` : `[ST+${minus}]`;
        return GURPS.executeOTF(roll, false, null, actor);
    }
}

class System {
    getSystemEnabled() {
        const system = game.system.id.toUpperCase();
        if (system === 'GURPS')
            return true;
        return false;
    }
    async rollAgainstAttractor(actor, minus) {
        const system = game.system.id.toUpperCase();
        if (system === 'GURPS') {
            const roller = new GURPSRoll();
            return roller.rollAgainstAttractor(actor, minus);
        }
        return undefined;
    }
}

class Attractor {
    constructor() {
        this.system = new System();
        this.started = false;
        this.delay = 2500;
        if (!game?.combat?.started) {
            this.createInterval();
        }
    }
    cancelInterval() {
        clearInterval(this.timer);
        this.timer = undefined;
    }
    createInterval() {
        console.log(this.timer);
        if (!this.timer)
            this.timer = setInterval(this.attractCompute.bind(this), this.delay);
    }
    isTokenAttracted(token) {
        const result = [];
        const { attractors, attracted } = this.populateTokens();
        if (attractors.length && attracted.includes(token)) {
            for (const attractor of attractors) {
                const stAttraction = String(attractor.document.getFlag(MODULE_NAME, 'distanceAttraction'));
                const distanceAttraction = stAttraction === 'null' ? 5 : Number(stAttraction);
                const distance = this.getDistance(attractor, token);
                if (distanceAttraction >= distance) {
                    result.push(attractor);
                }
            }
            if (result.length)
                return result;
        }
        return false;
    }
    getDistance(attractor, attracted) {
        return (game?.canvas?.grid?.measureDistance({ x: attractor.x, y: attractor.y }, { x: attracted.x, y: attracted.y }, { gridSpaces: true }) || 0);
    }
    async attractToken(attractor, attracted1, distanceAttraction, maxMoveGridSpeed, minMoveGridSpeed) {
        const distance = this.getDistance(attractor, attracted1);
        if (distance !== 0 && distance <= distanceAttraction) {
            const calculatedSpeed = (maxMoveGridSpeed / distanceAttraction) * (distanceAttraction - distance + 1);
            const moveGridSpeed = calculatedSpeed < minMoveGridSpeed ? minMoveGridSpeed : calculatedSpeed;
            const speedX = moveGridSpeed * (game?.canvas?.grid?.grid?.w || 0);
            const speedY = moveGridSpeed * (game?.canvas?.grid?.grid?.h || 0);
            const change = { x: attracted1.x, y: attracted1.y };
            const difX = attracted1.x - attractor.x;
            if (difX !== 0) {
                const speed = Math.abs(difX) > speedX ? speedX : Math.abs(difX);
                change.x = attracted1.x + (difX < 0 ? speed : -speed);
            }
            const difY = attracted1.y - attractor.y;
            if (difY !== 0) {
                const speed = Math.abs(difY) > speedY ? speedY : Math.abs(difY);
                change.y = attracted1.y + (difY < 0 ? speed : -speed);
            }
            const path = new Ray({ x: attracted1.x, y: attracted1.y }, { x: change.x, y: change.y });
            await attracted1.animateMovement(path);
            await attracted1.document.setFlag(MODULE_NAME, 'movementAttracted', true);
            await attracted1.document.update({ x: change.x, y: change.y, byAttractor: true });
            await attracted1.document.unsetFlag(MODULE_NAME, 'movementAttracted');
        }
    }
    getModifier(attracted, attractor) {
        const stAttraction = String(attractor.document.getFlag(MODULE_NAME, 'distanceAttraction'));
        const distanceAttraction = stAttraction === 'null' ? 5 : Number(stAttraction);
        const distance = this.getDistance(attractor, attracted);
        if (distance !== 0 && distance <= distanceAttraction) {
            String(attractor.document.getFlag(MODULE_NAME, 'minModifier'));
            const stMaxModifier = String(attractor.document.getFlag(MODULE_NAME, 'maxModifier'));
            const maxModifier = stMaxModifier === 'null' ? 0 : Number(stMaxModifier);
            const calculatedModifier = (maxModifier / distanceAttraction) * (distanceAttraction - distance + 1);
            const moveModifier = Math.round(calculatedModifier);
            return moveModifier;
        }
        return 0;
    }
    async attractCompute(combatant) {
        if (game?.paused)
            return;
        if (!combatant && game?.combat?.started) {
            return;
        }
        const onlyInCombat = game.settings.get('token-attractor', 'only-in-combat');
        if (onlyInCombat && !game?.combat?.started) {
            return;
        }
        this.cancelInterval();
        this.started = false;
        const { attractors, attracted } = this.populateTokens();
        for (const attractor of attractors) {
            const maxMoveGridSpeed = Number(attractor.document.getFlag(MODULE_NAME, 'maxForceAttraction')) || 0.5;
            const minMoveGridSpeed = Number(attractor.document.getFlag(MODULE_NAME, 'minForceAttraction')) || 0.5;
            const stAttraction = String(attractor.document.getFlag(MODULE_NAME, 'distanceAttraction'));
            const distanceAttraction = stAttraction === 'null' ? 5 : Number(stAttraction);
            if (!combatant) {
                for (const attracted1 of attracted) {
                    await this.attractToken(attractor, attracted1, distanceAttraction, maxMoveGridSpeed, minMoveGridSpeed);
                }
            }
            else if (attracted.includes(combatant.token?.object)) {
                await this.attractToken(attractor, combatant?.token?.object, distanceAttraction, maxMoveGridSpeed, minMoveGridSpeed);
            }
        }
        this.createInterval();
    }
    populateTokens() {
        const tokens = game?.canvas?.tokens?.placeables || [];
        const attractors = tokens.filter((token) => token.document.getFlag(MODULE_NAME, 'isAttractor'));
        const attracted = tokens.filter((token) => token.document.getFlag(MODULE_NAME, 'isAttracted'));
        return {
            attractors,
            attracted,
        };
    }
}

class Roller {
    async callForRoll(combatantId, modifier) {
        const system = new System();
        if (!system.getSystemEnabled)
            return false;
        return new Promise((resolve, reject) => {
            const d = new Dialog({
                title: game.i18n.localize('tokenAttractor.callForRoll.dialogTitle'),
                content: `<p>${game.i18n.localize('tokenAttractor.callForRoll.dialogTitle')}</p>`,
                buttons: {
                    roll: {
                        icon: '<i class="fas fa-check"></i>',
                        label: game.i18n.localize('tokenAttractor.callForRoll.dialogButton'),
                        callback: async () => {
                            const combatant = game.combat?.combatants?.find((combatant) => combatant.id === combatantId);
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

const functionsToRegister = {
    callForRoll: (combatantId, modifier) => {
        const roller = new Roller();
        return roller.callForRoll(combatantId, modifier);
    },
};
function registerFunctions() {
    TokenAttractor.socket = socketlib.registerModule(MODULE_NAME);
    for (const [alias, func] of Object.entries(functionsToRegister)) {
        TokenAttractor.socket.register(alias, func);
    }
}

function ensureDefined(value, message) {
    if (value === undefined || value === null) {
        ui.notifications?.error(message);
        throw new Error(message);
    }
}

function getPriority(user, actor) {
    let priority = 0;
    if (user.character === actor)
        priority += 100;
    if (actor.testUserPermission(user, 'OWNER'))
        priority += 10;
    if (user.isGM)
        priority -= 1;
    if (!user.active)
        priority -= 1000;
    return priority;
}
function highestPriorityUsers(actor) {
    ensureDefined(game.users, 'game not initialized');
    const priorities = new Map(game.users.map((user) => [user, getPriority(user, actor)]));
    const maxPriority = Math.max(...priorities.values());
    return game.users.filter((user) => priorities.get(user) === maxPriority);
}

let attractor;
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
        if (!game?.user?.isGM)
            return;
        attractor = new Attractor();
    });
    Hooks.on('canvasReady', () => {
        if (!game?.user?.isGM)
            return;
        if (!attractor)
            attractor = new Attractor();
    });
    Hooks.on('deleteCombat', async (combat) => {
        attractor.createInterval();
    });
    Hooks.on('updateCombat', async (combat) => {
        const timeout = setTimeout(async () => {
            const combatant = combat?.combatant;
            if (!combatant?.token?.object)
                return;
            if (!attractor)
                attractor = new Attractor();
            const isTokenAttracted = attractor.isTokenAttracted(combatant?.token?.object);
            if (!isTokenAttracted)
                return;
            if (!combatant?.actor)
                return;
            const users = highestPriorityUsers(combatant.actor);
            if (!users.length)
                return;
            const combatantId = combatant?.id || undefined;
            for (const attractorToken of isTokenAttracted) {
                const modifier = attractor.getModifier(combatant?.token?.object, attractorToken);
                const result = await TokenAttractor.socket.executeAsUser('callForRoll', users[0]?.id || '', combatantId, modifier);
                if (!result) {
                    console.log('HE FALLADO');
                    attractor.attractCompute(combat?.combatant);
                }
                else {
                    const margin = GURPS.lastTargetedRoll.margin;
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

// Import TypeScript modules
let appId = '';
appId = '3';
const globals = {
    appId,
};
window.TokenAttractor = globals;
registerHooks();
//# sourceMappingURL=token-attractor.js.map
