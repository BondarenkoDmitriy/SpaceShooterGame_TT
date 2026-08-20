import * as PIXI from 'pixi.js';

export class Character {
  constructor(app, spriteURL, x, y, scale = 0.1, anchor = 0.5) {
    this.app = app;
    this.obj = PIXI.Sprite.from(spriteURL);
    this.obj.anchor.set(anchor);
    this.obj.scale.set(scale);
    this.obj.x = x;
    this.obj.y = y;

    if (this.app && this.app.stage) {
      this.app.stage.addChild(this.obj);
    }
  }

  move(x, y, speed, cb = () => {}) {
    if (!this.app || !this.app.ticker) return;
    this.moveTicker = (delta) => {
      if (!this.obj || !this.obj.parent) return;
      if (Math.abs(this.obj.x - x) > 0.01) {
        this.obj.x += delta * speed;
      }
      if (Math.abs(this.obj.y - y) > 0.01) {
        this.obj.y += delta * speed;
      }
      cb();
    };
    this.app.ticker.add(this.moveTicker);
  }

  destroy() {
    if (this.app && this.app.ticker && this.moveTicker) {
      this.app.ticker.remove(this.moveTicker);
    }
    if (this.obj && this.obj.parent) {
      this.obj.parent.removeChild(this.obj);
      this.obj.destroy();
    }
  }
}

