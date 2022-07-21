import { registerSettings } from './settings.js';
import { registerHelpers, registerPartials } from './handlebars.js';

export function registerHooks(): void {
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
