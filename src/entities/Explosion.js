import * as PIXI from 'pixi.js';

export class Explosion {
  /**
   * @param {PIXI.Application} app
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   */
  constructor(app, x, y, scale = 0.25) {
    this.app = app;
    this.sprite = PIXI.Sprite.from('Sprites/Boom.png');
    this.sprite.anchor.set(0.5);
    this.sprite.position.set(x, y);
    this.sprite.scale.set(scale);

    if (this.app && this.app.stage) {
      this.app.stage.addChild(this.sprite);
    }

    this.alpha = 1;
    this.scale = scale;
  }

  update(delta) {
    if (!this.sprite) return false;
    this.alpha -= 0.05 * (delta || 1);
    this.scale += 0.01 * (delta || 1);

    this.sprite.alpha = Math.max(0, this.alpha);
    this.sprite.scale.set(this.scale);

    if (this.alpha <= 0) {
      this.destroy();
      return false;
    }
    return true;
  }

  destroy() {
    if (this.sprite) {
      if (this.sprite.parent) {
        this.sprite.parent.removeChild(this.sprite);
      }
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
