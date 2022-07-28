import { MODULE_NAME } from '../constants.js';

export function registerSettings(): void {
  game.settings.register(MODULE_NAME, 'only-in-combat', {
    scope: 'world',
    type: Boolean,
    default: true,
    name: 'Only attract in combat',
    hint: 'The vortex will only attract tokens when they are in combat mode',
    config: true,
  });
}
