// Import TypeScript modules
import { registerHooks } from './util/setup/hooks.js';
import { SockerLibSocket } from './util/setup/socketkib.js';

let appId = '';
appId = '3';
const globals = {
  appId,
};

declare global {
  const TokenAttractor: typeof globals & { socket: SockerLibSocket };
  interface Window {
    TokenAttractor: typeof globals;
  }
  interface LenientGlobalVariableTypes {
    game: Game;
  }
}

window.TokenAttractor = globals;

registerHooks();
