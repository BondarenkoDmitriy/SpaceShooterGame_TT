import { Character } from './CharacterC';

export class Rocket extends Character {
  constructor(app, spriteURL, x, y, scale = 0.07, anchor = 0.5) {
    super(app, spriteURL, x, y, scale, anchor);
    this.speed = 8;
    this.keys = {};

    this.onKeyDown = (e) => {
      this.keys[e.keyCode] = true;
    };

    this.onKeyUp = (e) => {
      this.keys[e.keyCode] = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.updateTicker = (delta) => {
      this.update(delta);
    };

    if (this.app && this.app.ticker) {
      this.app.ticker.add(this.updateTicker);
    }
  }

  update(delta) {
    if (!this.obj || !this.app) return;
    const moveStep = this.speed * (delta || 1);

    // ArrowLeft (37) or 'A' (65)
    if (this.keys[37] || this.keys[65]) {
      this.obj.x -= moveStep;
    }
    // ArrowRight (39) or 'D' (68)
    if (this.keys[39] || this.keys[68]) {
      this.obj.x += moveStep;
    }

    const halfWidth = (this.obj.width || 40) / 2;
    if (this.obj.x - halfWidth < 0) {
      this.obj.x = halfWidth;
    } else if (this.obj.x + halfWidth > this.app.screen.width) {
      this.obj.x = this.app.screen.width - halfWidth;
    }
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    if (this.app && this.app.ticker && this.updateTicker) {
      this.app.ticker.remove(this.updateTicker);
    }
    super.destroy();
  }
}

