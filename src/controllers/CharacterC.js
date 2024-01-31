import * as PIXI from 'pixi.js';
import { startGame } from '../index';

export class Character {
  constructor(spriteURL, x, y, scale = 0.1, anchor = 0.5) {
    this.create(spriteURL, x, y, scale, anchor)
  }

  async create (spriteURL, x, y, scale, anchor){
    this.obj = await PIXI.Sprite.from(spriteURL);
    this.obj.anchor.set(anchor);
    this.obj.scale.set(scale);
    
    this.obj.x = x;
    this.obj.y = y;

    startGame.app.stage.addChild(this.obj);
  }

  move(x, y, speed, cb = () => {}) {
    startGame.app.ticker.add((delta) => {
      if (Math.abs(this.obj.x - x) > 0.01) {
        this.obj.x += delta * speed;
      }

      if (Math.abs(this.obj.y - y) > 0.01) {
        this.obj.y += delta * speed;
      }
      
    cb();
    });
  }
}
