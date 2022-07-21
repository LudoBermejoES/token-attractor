import { MODULE_NAME } from '../constants.js';

export function registerSettings(): void {
  game.settings.register(MODULE_NAME, 'st-characteristic', {
    scope: 'world',
    type: String,
    default: 'data.ST.val',
    name: 'What characteristic we are looking for Strenght',
    hint: 'Streght value to check the amount of space the token will move',
    config: true,
  });
}
