import * as PIXI from 'pixi.js';
import { startGame } from '../index';

export class Character {
  constructor(spriteURL, x, y, scale = 0.1, anchor = 0.5) {
    this.create(spriteURL, x, y, scale, anchor)
  }

  async create (spriteURL, x, y, scale, anchor){
    this.player = await PIXI.Sprite.from(spriteURL);
    this.player.anchor.set(anchor);
    this.player.scale.set(scale);
    
    this.player.x = x;
    this.player.y = y;

    startGame.app.stage.addChild(this.player);
  }

  move(x, y, speed, cb = () => {}) {
    startGame.app.ticker.add((delta) => {
      if (Math.abs(this.player.x - x) > 0.01) {
        this.player.x += delta * speed;
      }

      if (Math.abs(this.player.y - y) > 0.01) {
        this.player.y += delta * speed;
      }
      
    cb();
    });
  }
}
