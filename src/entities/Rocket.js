import { Character } from './Character.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class Rocket extends Character {
  constructor(app, spriteURL = 'Sprites/rocket.png', x, y, scale = 0.07) {
    super(app, spriteURL, x, y, scale);
    this.speed = GAME_CONFIG.PLAYER_SPEED;
    this.keys = {};

    this.onKeyDown = (e) => {
      this.keys[e.keyCode] = true;
    };

    this.onKeyUp = (e) => {
      this.keys[e.keyCode] = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  update(delta) {
    if (this.isDestroyed || !this.obj) return;
    const moveStep = this.speed * (delta || 1);

    // ArrowLeft (37) or 'A' (65)
    if (this.keys[37] || this.keys[65]) {
      this.obj.x -= moveStep;
    }
    // ArrowRight (39) or 'D' (68)
    if (this.keys[39] || this.keys[68]) {
      this.obj.x += moveStep;
    }

    // Strict boundary clamping
    const halfWidth = this.width / 2;
    if (this.obj.x - halfWidth < 0) {
      this.obj.x = halfWidth;
    } else if (this.obj.x + halfWidth > GAME_CONFIG.CANVAS_WIDTH) {
      this.obj.x = GAME_CONFIG.CANVAS_WIDTH - halfWidth;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    super.destroy();
  }
}
