// Import TypeScript modules
import { registerHooks } from './util/setup/hooks.js';

let appId = '';
appId = '3';
const globals = {
  appId,
};

declare global {
  const EasyCombat: typeof globals;
  interface Window {
    EasyCombat: typeof globals;
  }
  interface LenientGlobalVariableTypes {
    game: Game;
  }
}

window.EasyCombat = globals;

registerHooks();
