import { MODULE_NAME } from '../util/constants';
import System from './system';

export default class Attractor {
  started: boolean;
  delay: number;
  timer: any;
  system: System;

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
    if (!this.timer) this.timer = setInterval(this.attractCompute.bind(this), this.delay);
  }

  isTokenAttracted(token: Token): Token[] | false {
    const result: Token[] = [];
    const { attractors, attracted } = this.populateTokens();
    if (attractors.length && attracted.includes(token)) {
      for (const attractor of attractors) {
        const stAttraction = String(attractor.document.getFlag(MODULE_NAME, 'distanceAttraction'));
        const distanceAttraction: number = stAttraction === 'null' ? 5 : Number(stAttraction);
        const distance = this.getDistance(attractor, token);
        if (distanceAttraction >= distance) {
          result.push(attractor);
        }
      }
      if (result.length) return result;
    }
    return false;
  }

  getDistance(attractor: Token, attracted: Token): number {
    return (
      game?.canvas?.grid?.measureDistance(
        { x: attractor.x, y: attractor.y },
        { x: attracted.x, y: attracted.y },
        { gridSpaces: true },
      ) || 0
    );
  }

  async attractToken(
    attractor: Token,
    attracted1: Token,
    distanceAttraction: number,
    maxMoveGridSpeed: number,
    minMoveGridSpeed: number,
  ) {
    const distance: number = this.getDistance(attractor, attracted1);

    if (distance !== 0 && distance <= distanceAttraction) {
      const calculatedSpeed: number = (maxMoveGridSpeed / distanceAttraction) * (distanceAttraction - distance + 1);
      const moveGridSpeed: number = calculatedSpeed < minMoveGridSpeed ? minMoveGridSpeed : calculatedSpeed;
      const speedX = moveGridSpeed * (game?.canvas?.grid?.grid?.w || 0);
      const speedY = moveGridSpeed * (game?.canvas?.grid?.grid?.h || 0);

      const change: { x: number; y: number } = { x: attracted1.x, y: attracted1.y };
      const difX = attracted1.x - attractor.x;
      if (difX !== 0) {
        const speed = Math.abs(difX) > speedX ? speedX : Math.abs(difX);
        change.x = attracted1.x + (difX < 0 ? speed : -speed);
        2;
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

  getModifier(attracted: Token, attractor: Token): number {
    const stAttraction = String(attractor.document.getFlag(MODULE_NAME, 'distanceAttraction'));
    const distanceAttraction: number = stAttraction === 'null' ? 5 : Number(stAttraction);
    const distance: number = this.getDistance(attractor, attracted);

    if (distance !== 0 && distance <= distanceAttraction) {
      const stMinModifier = String(attractor.document.getFlag(MODULE_NAME, 'minModifier'));
      const stMaxModifier = String(attractor.document.getFlag(MODULE_NAME, 'maxModifier'));
      const minModifier: number = stMinModifier === 'null' ? 0 : Number(stMinModifier);
      const maxModifier: number = stMaxModifier === 'null' ? 0 : Number(stMaxModifier);

      const calculatedModifier: number = (maxModifier / distanceAttraction) * (distanceAttraction - distance + 1);
      const moveModifier: number = Math.round(calculatedModifier);
      return moveModifier;
    }
    return 0;
  }

  async attractCompute(combatant: Combatant | null | undefined) {
    if (game?.paused) return;

    if (!combatant && game?.combat?.started) {
      return;
    }

    const onlyInCombat: any = game.settings.get('token-attractor', 'only-in-combat');
    if (onlyInCombat && !game?.combat?.started) {
      return;
    }

    this.cancelInterval();
    this.started = false;
    const { attractors, attracted } = this.populateTokens();
    for (const attractor of attractors) {
      const maxMoveGridSpeed: number = Number(attractor.document.getFlag(MODULE_NAME, 'maxForceAttraction')) || 0.5;
      const minMoveGridSpeed: number = Number(attractor.document.getFlag(MODULE_NAME, 'minForceAttraction')) || 0.5;
      const stAttraction = String(attractor.document.getFlag(MODULE_NAME, 'distanceAttraction'));
      const distanceAttraction: number = stAttraction === 'null' ? 5 : Number(stAttraction);
      if (!combatant) {
        for (const attracted1 of attracted) {
          await this.attractToken(attractor, attracted1, distanceAttraction, maxMoveGridSpeed, minMoveGridSpeed);
        }
      } else if (attracted.includes(combatant.token?.object as Token)) {
        await this.attractToken(
          attractor,
          combatant?.token?.object as Token,
          distanceAttraction,
          maxMoveGridSpeed,
          minMoveGridSpeed,
        );
      }
    }
    this.createInterval();
  }

  populateTokens(): { attractors: Token[]; attracted: Token[] } {
    const tokens: Token[] = game?.canvas?.tokens?.placeables || [];
    const attractors: Token[] = tokens.filter((token: Token) => token.document.getFlag(MODULE_NAME, 'isAttractor'));
    const attracted: Token[] = tokens.filter((token: Token) => token.document.getFlag(MODULE_NAME, 'isAttracted'));
    return {
      attractors,
      attracted,
    };
  }
}
