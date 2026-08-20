import * as PIXI from 'pixi.js';
import { Character } from './Character.js';
import { GAME_CONFIG } from '../config/GameConfig.js';

export class Boss extends Character {
  constructor(app, x = GAME_CONFIG.CANVAS_WIDTH / 2, y = 130, scale = 0.25) {
    super(app, 'Sprites/Boss.png', x, y, scale);

    this.maxHP = GAME_CONFIG.BOSS_MAX_HP;
    this.hp = GAME_CONFIG.BOSS_MAX_HP;
    this.speed = GAME_CONFIG.BOSS_SPEED;
    this.direction = 1;

    this.createHealthBar();
  }

  createHealthBar() {
    this.healthBarContainer = new PIXI.Container();

    const width = 140;
    const height = 16;

    // Outer frame / background
    const bg = new PIXI.Graphics();
    bg.beginFill(0x111827, 0.95);
    bg.lineStyle(2, 0xff2244, 1);
    bg.drawRoundedRect(-width / 2, -height / 2, width, height, 4);
    bg.endFill();

    this.healthBarFill = new PIXI.Graphics();
    this.updateHealthBarGraphics();

    this.healthBarContainer.addChild(bg);
    this.healthBarContainer.addChild(this.healthBarFill);

    if (this.app && this.app.stage) {
      this.app.stage.addChild(this.healthBarContainer);
    }
  }

  updateHealthBarGraphics() {
    if (!this.healthBarFill) return;
    this.healthBarFill.clear();

    const totalWidth = 136;
    const height = 12;
    const hpRatio = Math.max(0, this.hp / this.maxHP);
    const fillWidth = totalWidth * hpRatio;

    if (fillWidth > 0) {
      // Crimson Red fill
      this.healthBarFill.beginFill(0xff0044, 1);
      this.healthBarFill.drawRoundedRect(-totalWidth / 2, -height / 2, fillWidth, height, 2);
      this.healthBarFill.endFill();

      // Top 3D highlight
      this.healthBarFill.beginFill(0xff6688, 0.6);
      this.healthBarFill.drawRoundedRect(-totalWidth / 2, -height / 2, fillWidth, height / 3, 2);
      this.healthBarFill.endFill();

      // 4 Ticks for 4 HPs
      this.healthBarFill.lineStyle(1.5, 0x0f172a, 0.8);
      for (let i = 1; i < 4; i++) {
        const tickX = -totalWidth / 2 + (totalWidth / 4) * i;
        if (tickX < -totalWidth / 2 + fillWidth) {
          this.healthBarFill.moveTo(tickX, -height / 2);
          this.healthBarFill.lineTo(tickX, height / 2);
        }
      }
    }
  }

  takeDamage(amount = 1) {
    this.hp = Math.max(0, this.hp - amount);
    this.updateHealthBarGraphics();
    return this.hp <= 0;
  }

  update(delta) {
    if (this.isDestroyed || !this.obj) return;

    this.obj.x += this.speed * this.direction * (delta || 1);

    const margin = 120;
    if (this.obj.x > GAME_CONFIG.CANVAS_WIDTH - margin) {
      this.obj.x = GAME_CONFIG.CANVAS_WIDTH - margin;
      this.direction = -1;
    } else if (this.obj.x < margin) {
      this.obj.x = margin;
      this.direction = 1;
    }

    if (this.healthBarContainer) {
      this.healthBarContainer.x = this.obj.x;
      this.healthBarContainer.y = this.obj.y - this.height / 2 - 25;
    }
  }

  destroy() {
    if (this.healthBarContainer) {
      if (this.healthBarContainer.parent) {
        this.healthBarContainer.parent.removeChild(this.healthBarContainer);
      }
      this.healthBarContainer.destroy({ children: true });
      this.healthBarContainer = null;
    }
    super.destroy();
  }
}
