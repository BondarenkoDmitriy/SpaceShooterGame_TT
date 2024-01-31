import { Character } from './CharacterC';
import { startGame } from '../index';

export class Rocket extends Character {
  constructor(spriteURL, x, y, scale = 0.1, anchor = 0.5) {
    super(spriteURL, x, y, scale, anchor);

    window.addEventListener('keydown', this.keysDown);
  }

  moveLeft() {
    if (this.obj.x - 5 >= 0 + this.obj.width / 2) {
      this.obj.x -= 8;
    }
  }

  moveRight() {
    if (this.obj.x + 5 <= startGame.app.screen.width - this.obj.width / 2) {
      this.obj.x += 8;
    }
  }

  keysDown = (e) => {
    if (e.keyCode === 37) {
      this.moveLeft();
    } else if (e.keyCode === 39) {
      this.moveRight();
    }
  }
}
