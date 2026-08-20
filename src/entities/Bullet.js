import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class Bullet {
  /**
   * @param {PIXI.Application} app
   * @param {number} x
   * @param {number} y
   * @param {boolean} isBossBullet
   */
  constructor(app, x, y, isBossBullet = false) {
    this.app = app;
    this.isBossBullet = isBossBullet;
    this.isDestroyed = false;

    this.speed = isBossBullet 
      ? GAME_CONFIG.BOSS_BULLET_SPEED 
      : GAME_CONFIG.PLAYER_BULLET_SPEED;

    this.graphic = new PIXI.Graphics();
    this.renderGraphic();

    this.graphic.x = x;
    this.graphic.y = y;

    if (this.app && this.app.stage) {
      this.app.stage.addChild(this.graphic);
    }
  }

  renderGraphic() {
    this.graphic.clear();
    if (this.isBossBullet) {
      // Red Boss Plasma Projectile
      this.graphic.beginFill(0xff0055, 0.4);
      this.graphic.drawCircle(0, 0, 10);
      this.graphic.endFill();
      this.graphic.beginFill(0xff3300, 1);
      this.graphic.drawCircle(0, 0, 6);
      this.graphic.endFill();
      this.graphic.beginFill(0xffffff, 1);
      this.graphic.drawCircle(0, 0, 3);
      this.graphic.endFill();
    } else {
      // Cyan Player Laser Beam
      this.graphic.beginFill(0x00ffff, 0.5);
      this.graphic.drawRoundedRect(-4, -12, 8, 24, 4);
      this.graphic.endFill();
      this.graphic.beginFill(0xffffff, 1);
      this.graphic.drawRoundedRect(-2, -10, 4, 20, 2);
      this.graphic.endFill();
    }
  }

  get x() {
    return this.graphic ? this.graphic.x : 0;
  }

  get y() {
    return this.graphic ? this.graphic.y : 0;
  }

  getBounds() {
    return this.graphic ? this.graphic.getBounds() : new PIXI.Rectangle();
  }

  update(delta) {
    if (this.isDestroyed || !this.graphic) return;

    if (this.isBossBullet) {
      this.graphic.y += this.speed * (delta || 1);
    } else {
      this.graphic.y -= this.speed * (delta || 1);
    }
  }

  isOutOfBounds() {
    if (!this.graphic) return true;
    if (this.isBossBullet) {
      return this.graphic.y > GAME_CONFIG.CANVAS_HEIGHT + 20;
    } else {
      return this.graphic.y < -20;
    }
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.graphic) {
      if (this.graphic.parent) {
        this.graphic.parent.removeChild(this.graphic);
      }
      this.graphic.destroy();
      this.graphic = null;
    }
  }
}
