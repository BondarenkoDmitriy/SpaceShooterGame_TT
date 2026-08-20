import * as PIXI from 'pixi.js';

export class Character {
  /**
   * @param {PIXI.Application} app
   * @param {string|PIXI.Texture} textureOrUrl
   * @param {number} x
   * @param {number} y
   * @param {number} scale
   * @param {number} anchor
   */
  constructor(app, textureOrUrl, x = 0, y = 0, scale = 0.1, anchor = 0.5) {
    this.app = app;
    this.isDestroyed = false;

    const texture = typeof textureOrUrl === 'string'
      ? PIXI.Texture.from(textureOrUrl)
      : textureOrUrl;

    this.obj = new PIXI.Sprite(texture);
    this.obj.anchor.set(anchor);
    this.obj.scale.set(scale);
    this.obj.x = x;
    this.obj.y = y;

    if (this.app && this.app.stage) {
      this.app.stage.addChild(this.obj);
    }
  }

  get x() {
    return this.obj ? this.obj.x : 0;
  }

  set x(val) {
    if (this.obj) this.obj.x = val;
  }

  get y() {
    return this.obj ? this.obj.y : 0;
  }

  set y(val) {
    if (this.obj) this.obj.y = val;
  }

  get width() {
    return this.obj ? this.obj.width : 0;
  }

  get height() {
    return this.obj ? this.obj.height : 0;
  }

  getBounds() {
    return this.obj ? this.obj.getBounds() : new PIXI.Rectangle();
  }

  update(delta) {
    // Override in derived classes
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.obj) {
      if (this.obj.parent) {
        this.obj.parent.removeChild(this.obj);
      }
      this.obj.destroy();
      this.obj = null;
    }
  }
}
