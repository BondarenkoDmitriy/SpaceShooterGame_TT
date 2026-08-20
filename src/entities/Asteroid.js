import { Character } from './Character.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class Asteroid extends Character {
  constructor(app, x, y, scale = 0.12) {
    super(app, 'Sprites/comet.png', x, y, scale);
    
    this.speedY = GAME_CONFIG.ASTEROID_MIN_SPEED + 
      Math.random() * (GAME_CONFIG.ASTEROID_MAX_SPEED - GAME_CONFIG.ASTEROID_MIN_SPEED);
    this.rotationSpeed = (Math.random() - 0.5) * 0.03;
  }

  update(delta) {
    if (this.isDestroyed || !this.obj) return;
    this.obj.y += this.speedY * (delta || 1);
    this.obj.rotation += this.rotationSpeed * (delta || 1);
  }

  isOutOfBounds() {
    return this.obj && this.obj.y > GAME_CONFIG.CANVAS_HEIGHT + 50;
  }
}
