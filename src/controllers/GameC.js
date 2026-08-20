import * as PIXI from 'pixi.js';
import { GAME_CONFIG } from '../config/GameConfig.js';
import { Rocket } from '../entities/Rocket.js';
import { Asteroid } from '../entities/Asteroid.js';
import { Boss } from '../entities/Boss.js';
import { Bullet } from '../entities/Bullet.js';
import { Explosion } from '../entities/Explosion.js';
import { UIController } from './UIC.js';

export class Game {
  constructor() {
    this.app = new PIXI.Application({
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      backgroundColor: 0x05070f,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    const container = document.getElementById('GameContainer');
    if (container) {
      container.appendChild(this.app.view);
    }

    this.uiController = new UIController();

    // Textures
    this.spaceTexture = PIXI.Texture.from('Sprites/space.png');
    this.bossLocationTexture = PIXI.Texture.from('Sprites/boss_location.png');

    // Tiling Background
    this.background = new PIXI.TilingSprite(
      this.spaceTexture,
      this.app.screen.width,
      this.app.screen.height
    );
    this.app.stage.addChild(this.background);

    // Game state
    this.gameActive = false;
    this.currentLevel = 1;
    this.remainingBullets = GAME_CONFIG.MAX_BULLETS;
    this.cometsHit = 0;
    this.totalCometsSpawned = 0;
    this.timeLeft = GAME_CONFIG.LEVEL_TIME_LIMIT;

    this.asteroids = [];
    this.playerBullets = [];
    this.bossBullets = [];
    this.explosions = [];
    this.boss = null;
    this.rocket = null;
    this.statusText = null;

    // Shooting listener
    this.onKeyDown = (e) => {
      if (e.code === 'Space') {
        this.fireBullet();
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    // Main Loop Ticker
    this.app.ticker.add((delta) => this.gameLoop(delta));
  }

  pushToStart() {
    this.resetGame();
    this.uiController.showStartButton(false);
    this.uiController.hideEndModal();

    this.gameActive = true;
    this.currentLevel = 1;

    this.createRocket();
    this.startLevel1();
  }

  resetGame() {
    this.gameActive = false;
    this.clearTimers();

    // Destroy entities
    this.asteroids.forEach((ast) => ast.destroy());
    this.asteroids = [];

    this.playerBullets.forEach((b) => b.destroy());
    this.playerBullets = [];

    this.bossBullets.forEach((b) => b.destroy());
    this.bossBullets = [];

    this.explosions.forEach((ex) => ex.destroy());
    this.explosions = [];

    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }

    if (this.rocket) {
      this.rocket.destroy();
      this.rocket = null;
    }

    if (this.statusText && this.statusText.parent) {
      this.statusText.parent.removeChild(this.statusText);
      this.statusText.destroy();
      this.statusText = null;
    }

    // Reset background texture
    this.background.texture = this.spaceTexture;

    // Reset stats
    this.currentLevel = 1;
    this.remainingBullets = GAME_CONFIG.MAX_BULLETS;
    this.cometsHit = 0;
    this.totalCometsSpawned = 0;
    this.timeLeft = GAME_CONFIG.LEVEL_TIME_LIMIT;

    this.uiController.setTask(`Level 1: Destroy ${GAME_CONFIG.LEVEL_1_TARGET} Asteroids`);
    this.uiController.setBullets(GAME_CONFIG.MAX_BULLETS);
    this.uiController.setAsteroids(0, GAME_CONFIG.LEVEL_1_TARGET);
    this.uiController.setTimer(GAME_CONFIG.LEVEL_TIME_LIMIT);
  }

  clearTimers() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.asteroidInterval) clearInterval(this.asteroidInterval);
    if (this.bossShootInterval) clearInterval(this.bossShootInterval);
  }

  createRocket() {
    this.rocket = new Rocket(
      this.app,
      'Sprites/rocket.png',
      this.app.screen.width / 2,
      this.app.screen.height * 0.88,
      0.07
    );
  }

  startLevel1() {
    this.startCountdown();
    this.asteroidInterval = setInterval(() => {
      if (this.gameActive && this.currentLevel === 1 && this.totalCometsSpawned < GAME_CONFIG.LEVEL_1_TARGET) {
        this.createAsteroid();
      }
    }, 1500);

    this.createAsteroid();
  }

  createAsteroid() {
    if (this.totalCometsSpawned >= GAME_CONFIG.LEVEL_1_TARGET) return;
    this.totalCometsSpawned++;

    const padding = 60;
    const spawnX = padding + Math.random() * (this.app.screen.width - padding * 2);
    const spawnY = -40;
    const asteroid = new Asteroid(this.app, spawnX, spawnY);
    this.asteroids.push(asteroid);
  }

  startLevel2() {
    this.currentLevel = 2;
    this.clearTimers();

    // Clear remaining asteroids
    this.asteroids.forEach((ast) => ast.destroy());
    this.asteroids = [];

    // Refill ammo & reset timer
    this.remainingBullets = GAME_CONFIG.MAX_BULLETS;
    this.timeLeft = GAME_CONFIG.LEVEL_TIME_LIMIT;

    // Switch background texture
    this.background.texture = this.bossLocationTexture;

    // Update UI HUD
    this.uiController.setTask('Level 2: Defeat the Boss');
    this.uiController.setBullets(GAME_CONFIG.MAX_BULLETS);
    this.uiController.setBossHP(GAME_CONFIG.BOSS_MAX_HP, GAME_CONFIG.BOSS_MAX_HP);
    this.uiController.setTimer(GAME_CONFIG.LEVEL_TIME_LIMIT);

    this.showBanner('LEVEL 2: BOSS BATTLE!');
    this.createBoss();
    this.startCountdown();

    // Boss shooting loop
    this.bossShootInterval = setInterval(() => {
      if (this.gameActive && this.boss && !this.boss.isDestroyed) {
        this.fireBossBullet();
      }
    }, GAME_CONFIG.BOSS_SHOOT_INTERVAL_MS);
  }

  createBoss() {
    this.boss = new Boss(this.app, this.app.screen.width / 2, 130);
  }

  fireBullet() {
    if (!this.gameActive || this.remainingBullets <= 0 || !this.rocket || this.rocket.isDestroyed) return;

    this.remainingBullets--;
    this.uiController.setBullets(this.remainingBullets);

    const bullet = new Bullet(
      this.app,
      this.rocket.x,
      this.rocket.y - this.rocket.height / 2,
      false
    );
    this.playerBullets.push(bullet);
  }

  fireBossBullet() {
    if (!this.boss || this.boss.isDestroyed) return;

    const bullet = new Bullet(
      this.app,
      this.boss.x,
      this.boss.y + this.boss.height / 2,
      true
    );
    this.bossBullets.push(bullet);
  }

  startCountdown() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.uiController.setTimer(this.timeLeft);

    this.countdownInterval = setInterval(() => {
      if (!this.gameActive) return;
      this.timeLeft--;
      this.uiController.setTimer(this.timeLeft);

      if (this.timeLeft <= 0) {
        this.endGame(false, "Time's up! Mission failed.");
      }
    }, 1000);
  }

  isCollision(obj1, obj2) {
    if (!obj1 || !obj2) return false;
    const bounds1 = typeof obj1.getBounds === 'function' ? obj1.getBounds() : obj1;
    const bounds2 = typeof obj2.getBounds === 'function' ? obj2.getBounds() : obj2;

    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  gameLoop(delta) {
    // 1. Tiling background scroll
    this.background.tilePosition.y += GAME_CONFIG.BACKGROUND_SCROLL_SPEED * (delta || 1);

    if (!this.gameActive) return;

    // Update Player Rocket
    if (this.rocket && !this.rocket.isDestroyed) {
      this.rocket.update(delta);
    }

    // Update Boss AI & Healthbar
    if (this.currentLevel === 2 && this.boss && !this.boss.isDestroyed) {
      this.boss.update(delta);
    }

    // Update Explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const active = this.explosions[i].update(delta);
      if (!active) {
        this.explosions.splice(i, 1);
      }
    }

    // Update Asteroids & check collisions
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      if (ast && !ast.isDestroyed) {
        ast.update(delta);

        // Rocket vs Asteroid Collision
        if (this.rocket && !this.rocket.isDestroyed && this.isCollision(this.rocket, ast)) {
          this.createExplosion(this.rocket.x, this.rocket.y);
          this.endGame(false, 'Ship destroyed by asteroid!');
          return;
        }

        // Out of bounds
        if (ast.isOutOfBounds()) {
          ast.destroy();
          this.asteroids.splice(i, 1);
        }
      }
    }

    // Update Player Bullets & check collisions
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      if (bullet && !bullet.isDestroyed) {
        bullet.update(delta);

        let bulletRemoved = false;

        // Player Bullet vs Asteroid
        if (this.currentLevel === 1) {
          for (let j = this.asteroids.length - 1; j >= 0; j--) {
            const ast = this.asteroids[j];
            if (ast && !ast.isDestroyed && this.isCollision(bullet, ast)) {
              this.createExplosion(ast.x, ast.y);
              ast.destroy();
              this.asteroids.splice(j, 1);

              bullet.destroy();
              this.playerBullets.splice(i, 1);
              bulletRemoved = true;

              this.cometsHit++;
              this.uiController.setAsteroids(this.cometsHit, GAME_CONFIG.LEVEL_1_TARGET);

              if (this.cometsHit >= GAME_CONFIG.LEVEL_1_TARGET) {
                this.startLevel2();
                return;
              }
              break;
            }
          }
        }

        if (bulletRemoved) continue;

        // Player Bullet vs Boss Bullet
        for (let k = this.bossBullets.length - 1; k >= 0; k--) {
          const bossBullet = this.bossBullets[k];
          if (bossBullet && !bossBullet.isDestroyed && this.isCollision(bullet, bossBullet)) {
            this.createExplosion(bullet.x, bullet.y, 0.15);
            bullet.destroy();
            this.playerBullets.splice(i, 1);

            bossBullet.destroy();
            this.bossBullets.splice(k, 1);

            bulletRemoved = true;
            break;
          }
        }

        if (bulletRemoved) continue;

        // Player Bullet vs Boss
        if (this.currentLevel === 2 && this.boss && !this.boss.isDestroyed) {
          if (this.isCollision(bullet, this.boss)) {
            this.createExplosion(bullet.x, bullet.y, 0.2);
            bullet.destroy();
            this.playerBullets.splice(i, 1);

            const isDead = this.boss.takeDamage(1);
            this.uiController.setBossHP(this.boss.hp, GAME_CONFIG.BOSS_MAX_HP);

            if (isDead) {
              this.createExplosion(this.boss.x, this.boss.y, 0.5);
              this.boss.destroy();
              this.boss = null;
              this.endGame(true, 'Victory! Boss Defeated!');
              return;
            }
            continue;
          }
        }

        // Out of bounds
        if (bullet.isOutOfBounds()) {
          bullet.destroy();
          this.playerBullets.splice(i, 1);
        }
      }
    }

    // Update Boss Bullets & check collisions
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bossBullet = this.bossBullets[i];
      if (bossBullet && !bossBullet.isDestroyed) {
        bossBullet.update(delta);

        // Boss Bullet vs Player Rocket
        if (this.rocket && !this.rocket.isDestroyed && this.isCollision(bossBullet, this.rocket)) {
          this.createExplosion(this.rocket.x, this.rocket.y);
          this.endGame(false, 'Ship destroyed by Boss laser!');
          return;
        }

        // Out of bounds
        if (bossBullet.isOutOfBounds()) {
          bossBullet.destroy();
          this.bossBullets.splice(i, 1);
        }
      }
    }

    // Out of ammo check
    if (this.remainingBullets === 0 && this.playerBullets.length === 0) {
      if (this.currentLevel === 1 && this.cometsHit < GAME_CONFIG.LEVEL_1_TARGET) {
        this.endGame(false, 'Out of ammunition!');
      } else if (this.currentLevel === 2 && this.boss && this.boss.hp > 0) {
        this.endGame(false, 'Out of ammunition!');
      }
    }
  }

  createExplosion(x, y, scale = 0.25) {
    const ex = new Explosion(this.app, x, y, scale);
    this.explosions.push(ex);
  }

  showBanner(message) {
    const banner = new PIXI.Text(message, {
      fontFamily: 'Segoe UI, Arial',
      fontSize: 42,
      fontWeight: 'bold',
      fill: ['#ffffff', '#00ffcc'],
      stroke: '#05070f',
      strokeThickness: 6,
      dropShadow: true,
      dropShadowColor: '#00ffcc',
      dropShadowBlur: 10,
    });
    banner.anchor.set(0.5);
    banner.x = this.app.screen.width / 2;
    banner.y = this.app.screen.height / 2 - 80;

    this.app.stage.addChild(banner);

    setTimeout(() => {
      if (banner.parent) {
        banner.parent.removeChild(banner);
        banner.destroy();
      }
    }, 2000);
  }

  endGame(isWin, description) {
    this.gameActive = false;
    this.clearTimers();

    const textString = isWin ? 'YOU WIN' : 'YOU LOSE';
    const textColor = isWin ? ['#34d399', '#059669'] : ['#f87171', '#dc2626'];

    if (this.statusText && this.statusText.parent) {
      this.statusText.parent.removeChild(this.statusText);
      this.statusText.destroy();
    }

    this.statusText = new PIXI.Text(textString, {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: 84,
      fontWeight: '900',
      fill: textColor,
      stroke: '#000000',
      strokeThickness: 8,
      dropShadow: true,
      dropShadowColor: isWin ? '#10b981' : '#ef4444',
      dropShadowBlur: 20,
      dropShadowDistance: 0,
    });

    this.statusText.anchor.set(0.5);
    this.statusText.x = this.app.screen.width / 2;
    this.statusText.y = this.app.screen.height / 2 - 40;

    this.app.stage.addChild(this.statusText);

    setTimeout(() => {
      this.uiController.showEndModal(
        isWin,
        isWin ? 'VICTORY!' : 'GAME OVER',
        description,
        () => this.pushToStart(),
        () => {
          this.resetGame();
          this.uiController.showStartButton(true);
        }
      );
    }, 600);
  }
}