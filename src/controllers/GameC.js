import * as PIXI from 'pixi.js';
import { Character } from './CharacterC';
import { Rocket } from './RocketC';
import { UIController } from './UIC';

export class Game {
  constructor() {
    this.app = new PIXI.Application({
      width: 1280,
      height: 720,
      backgroundColor: 0x05070f,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    const container = document.getElementById('GameContainer');
    if (container) {
      container.appendChild(this.app.view);
    }

    this.uiController = new UIController();

    // Background TilingSprite for continuous scrolling
    this.spaceTexture = PIXI.Texture.from("../../Sprites/space.png");
    this.bossLocationTexture = PIXI.Texture.from("../../Sprites/boss_location.png");

    this.background = new PIXI.TilingSprite(
      this.spaceTexture,
      this.app.screen.width,
      this.app.screen.height
    );
    this.app.stage.addChild(this.background);

    // Main game state
    this.gameActive = false;
    this.currentLevel = 1;
    this.remainingBullets = 10;
    this.cometsHit = 0;
    this.totalCometsSpawned = 0;
    this.bossHP = 4;
    this.maxBossHP = 4;
    this.timeLeft = 60;

    this.asteroids = [];
    this.playerBullets = [];
    this.bossBullets = [];
    this.boss = null;
    this.bossDirection = 1; // 1 for right, -1 for left
    this.bossSpeed = 2.5;

    this.bossHealthBarContainer = null;
    this.bossHealthBarFill = null;

    this.statusText = null;

    // Listeners and tickers
    this.onKeyDown = (e) => {
      if (e.code === 'Space') {
        this.fireBullet();
      }
    };

    window.addEventListener('keydown', this.onKeyDown);

    // Bind ticker
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

    // Clear stage objects except background
    this.asteroids.forEach((ast) => ast.destroy());
    this.asteroids = [];

    this.playerBullets.forEach((b) => {
      if (b.parent) b.parent.removeChild(b);
      b.destroy();
    });
    this.playerBullets = [];

    this.bossBullets.forEach((b) => {
      if (b.parent) b.parent.removeChild(b);
      b.destroy();
    });
    this.bossBullets = [];

    if (this.boss) {
      this.boss.destroy();
      this.boss = null;
    }

    if (this.bossHealthBarContainer && this.bossHealthBarContainer.parent) {
      this.bossHealthBarContainer.parent.removeChild(this.bossHealthBarContainer);
      this.bossHealthBarContainer.destroy({ children: true });
      this.bossHealthBarContainer = null;
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

    // Reset background texture to Level 1 space
    this.background.texture = this.spaceTexture;

    // Reset stats
    this.currentLevel = 1;
    this.remainingBullets = 10;
    this.cometsHit = 0;
    this.totalCometsSpawned = 0;
    this.bossHP = 4;
    this.timeLeft = 60;

    this.uiController.setTask("Level 1: Destroy 5 Asteroids");
    this.uiController.setBullets(10);
    this.uiController.setAsteroids(0, 5);
    this.uiController.setTimer(60);
  }

  clearTimers() {
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    if (this.asteroidInterval) clearInterval(this.asteroidInterval);
    if (this.bossShootInterval) clearInterval(this.bossShootInterval);
  }

  createRocket() {
    this.rocket = new Rocket(
      this.app,
      "../../Sprites/rocket.png",
      this.app.screen.width / 2,
      this.app.screen.height * 0.88,
      0.07
    );
  }

  startLevel1() {
    this.startCountdown();
    this.asteroidInterval = setInterval(() => {
      if (this.gameActive && this.currentLevel === 1 && this.totalCometsSpawned < 5) {
        this.createAsteroid();
      }
    }, 1500);
    // Spawn first asteroid immediately
    this.createAsteroid();
  }

  createAsteroid() {
    if (this.totalCometsSpawned >= 5) return;
    this.totalCometsSpawned++;

    const padding = 60;
    const spawnX = padding + Math.random() * (this.app.screen.width - padding * 2);
    const spawnY = -40;
    const asteroid = new Character(this.app, "../../Sprites/comet.png", spawnX, spawnY, 0.12);
    asteroid.speedY = 2 + Math.random() * 1.5;
    this.asteroids.push(asteroid);
  }

  startLevel2() {
    this.currentLevel = 2;
    this.clearTimers();

    // Remove active asteroids
    this.asteroids.forEach((ast) => ast.destroy());
    this.asteroids = [];

    // Reset bullets and timer for Level 2
    this.remainingBullets = 10;
    this.timeLeft = 60;

    // Switch background texture seamlessly
    this.background.texture = this.bossLocationTexture;

    // Update UI HUD
    this.uiController.setTask("Level 2: Defeat the Boss");
    this.uiController.setBullets(10);
    this.uiController.setBossHP(4, 4);
    this.uiController.setTimer(60);

    // Show temporary Level 2 banner text
    this.showBanner("LEVEL 2: BOSS BATTLE!");

    // Create Boss & HP Bar
    this.createBoss();

    // Start Level 2 countdown timer
    this.startCountdown();

    // Start Boss Shooting Interval (every 2.0 seconds)
    this.bossShootInterval = setInterval(() => {
      if (this.gameActive && this.boss) {
        this.fireBossBullet();
      }
    }, 2000);
  }

  createBoss() {
    this.boss = new Character(
      this.app,
      "../../Sprites/boss.png",
      this.app.screen.width / 2,
      130,
      0.25
    );
    this.bossHP = 4;
    this.bossDirection = 1;

    this.createBossHealthBar();
  }

  createBossHealthBar() {
    if (this.bossHealthBarContainer) {
      if (this.bossHealthBarContainer.parent) {
        this.bossHealthBarContainer.parent.removeChild(this.bossHealthBarContainer);
      }
      this.bossHealthBarContainer.destroy({ children: true });
    }

    this.bossHealthBarContainer = new PIXI.Container();

    const width = 140;
    const height = 16;

    // Dark background container with red border
    const bg = new PIXI.Graphics();
    bg.beginFill(0x111827, 0.95);
    bg.lineStyle(2, 0xff2244, 1);
    bg.drawRoundedRect(-width / 2, -height / 2, width, height, 4);
    bg.endFill();

    // Red fill bar graphics
    this.bossHealthBarFill = new PIXI.Graphics();
    this.updateHealthBarGraphics();

    this.bossHealthBarContainer.addChild(bg);
    this.bossHealthBarContainer.addChild(this.bossHealthBarFill);

    this.app.stage.addChild(this.bossHealthBarContainer);
  }

  updateHealthBarGraphics() {
    if (!this.bossHealthBarFill) return;
    this.bossHealthBarFill.clear();

    const totalWidth = 136;
    const height = 12;
    const hpRatio = Math.max(0, this.bossHP / this.maxBossHP);
    const fillWidth = totalWidth * hpRatio;

    if (fillWidth > 0) {
      // Red Bar Fill
      this.bossHealthBarFill.beginFill(0xff0044, 1);
      this.bossHealthBarFill.drawRoundedRect(-totalWidth / 2, -height / 2, fillWidth, height, 2);
      this.bossHealthBarFill.endFill();

      // Top Highlight for polished 3D bar look
      this.bossHealthBarFill.beginFill(0xff6688, 0.6);
      this.bossHealthBarFill.drawRoundedRect(-totalWidth / 2, -height / 2, fillWidth, height / 3, 2);
      this.bossHealthBarFill.endFill();

      // Draw 4 distinct tick marks to show 4 hits remaining
      this.bossHealthBarFill.lineStyle(1.5, 0x0f172a, 0.8);
      for (let i = 1; i < 4; i++) {
        const tickX = -totalWidth / 2 + (totalWidth / 4) * i;
        if (tickX < -totalWidth / 2 + fillWidth) {
          this.bossHealthBarFill.moveTo(tickX, -height / 2);
          this.bossHealthBarFill.lineTo(tickX, height / 2);
        }
      }
    }
  }

  fireBullet() {
    if (!this.gameActive || this.remainingBullets <= 0 || !this.rocket) return;

    this.remainingBullets--;
    this.uiController.setBullets(this.remainingBullets);

    // Create PIXI.Graphics laser projectile as specified in PDF
    const bullet = new PIXI.Graphics();
    
    // Glowing Laser beam
    bullet.beginFill(0x00ffff, 0.5);
    bullet.drawRoundedRect(-4, -12, 8, 24, 4);
    bullet.endFill();
    bullet.beginFill(0xffffff, 1);
    bullet.drawRoundedRect(-2, -10, 4, 20, 2);
    bullet.endFill();

    bullet.x = this.rocket.obj.x;
    bullet.y = this.rocket.obj.y - this.rocket.obj.height / 2;

    this.app.stage.addChild(bullet);
    this.playerBullets.push(bullet);
  }

  fireBossBullet() {
    if (!this.boss || !this.boss.obj) return;

    // Create PIXI.Graphics red plasma projectile for Boss
    const bullet = new PIXI.Graphics();
    bullet.beginFill(0xff0055, 0.4);
    bullet.drawCircle(0, 0, 10);
    bullet.endFill();
    bullet.beginFill(0xff3300, 1);
    bullet.drawCircle(0, 0, 6);
    bullet.endFill();
    bullet.beginFill(0xffffff, 1);
    bullet.drawCircle(0, 0, 3);
    bullet.endFill();

    bullet.x = this.boss.obj.x;
    bullet.y = this.boss.obj.y + this.boss.obj.height / 2;

    this.app.stage.addChild(bullet);
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
    const bounds1 = obj1.getBounds();
    const bounds2 = obj2.getBounds();

    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds1.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds1.height > bounds2.y
    );
  }

  gameLoop(delta) {
    // 1. Continuous background scrolling
    this.background.tilePosition.y += 1.5 * (delta || 1);

    if (!this.gameActive) return;

    // 2. Boss movement & HP bar tracking
    if (this.currentLevel === 2 && this.boss && this.boss.obj) {
      this.boss.obj.x += this.bossSpeed * this.bossDirection * (delta || 1);

      const margin = 120;
      if (this.boss.obj.x > this.app.screen.width - margin) {
        this.boss.obj.x = this.app.screen.width - margin;
        this.bossDirection = -1;
      } else if (this.boss.obj.x < margin) {
        this.boss.obj.x = margin;
        this.bossDirection = 1;
      }

      if (this.bossHealthBarContainer) {
        this.bossHealthBarContainer.x = this.boss.obj.x;
        this.bossHealthBarContainer.y = this.boss.obj.y - this.boss.obj.height / 2 - 25;
      }
    }

    // 3. Move Asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const ast = this.asteroids[i];
      if (ast.obj) {
        ast.obj.y += (ast.speedY || 2.5) * (delta || 1);

        // Rocket collision with Asteroid
        if (this.rocket && this.isCollision(this.rocket.obj, ast.obj)) {
          this.endGame(false, "Ship destroyed by asteroid!");
          return;
        }

        // Out of bounds off bottom screen
        if (ast.obj.y > this.app.screen.height + 50) {
          ast.destroy();
          this.asteroids.splice(i, 1);
        }
      }
    }

    // 4. Move Player Bullets
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      bullet.y -= 10 * (delta || 1);

      let bulletRemoved = false;

      // Player Bullet vs Asteroids
      if (this.currentLevel === 1) {
        for (let j = this.asteroids.length - 1; j >= 0; j--) {
          const ast = this.asteroids[j];
          if (this.isCollision(bullet, ast.obj)) {
            // Destroy both
            ast.destroy();
            this.asteroids.splice(j, 1);

            this.app.stage.removeChild(bullet);
            bullet.destroy();
            this.playerBullets.splice(i, 1);
            bulletRemoved = true;

            this.cometsHit++;
            this.uiController.setAsteroids(this.cometsHit, 5);

            if (this.cometsHit >= 5) {
              this.startLevel2();
              return;
            }
            break;
          }
        }
      }

      if (bulletRemoved) continue;

      // Player Bullet vs Boss Bullets
      for (let k = this.bossBullets.length - 1; k >= 0; k--) {
        const bossBullet = this.bossBullets[k];
        if (this.isCollision(bullet, bossBullet)) {
          this.app.stage.removeChild(bullet);
          bullet.destroy();
          this.playerBullets.splice(i, 1);

          this.app.stage.removeChild(bossBullet);
          bossBullet.destroy();
          this.bossBullets.splice(k, 1);

          bulletRemoved = true;
          break;
        }
      }

      if (bulletRemoved) continue;

      // Player Bullet vs Boss
      if (this.currentLevel === 2 && this.boss && this.boss.obj) {
        if (this.isCollision(bullet, this.boss.obj)) {
          this.app.stage.removeChild(bullet);
          bullet.destroy();
          this.playerBullets.splice(i, 1);

          this.bossHP--;
          this.updateHealthBarGraphics();
          this.uiController.setBossHP(this.bossHP, 4);

          if (this.bossHP <= 0) {
            this.boss.destroy();
            this.boss = null;
            if (this.bossHealthBarContainer) {
              this.app.stage.removeChild(this.bossHealthBarContainer);
            }
            this.endGame(true, "Victory! Boss Defeated!");
            return;
          }
          continue;
        }
      }

      // Remove bullet if out of screen top
      if (bullet.y < -20) {
        this.app.stage.removeChild(bullet);
        bullet.destroy();
        this.playerBullets.splice(i, 1);
      }
    }

    // 5. Move Boss Bullets
    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bossBullet = this.bossBullets[i];
      bossBullet.y += 6 * (delta || 1);

      // Boss Bullet vs Player Rocket
      if (this.rocket && this.isCollision(bossBullet, this.rocket.obj)) {
        this.endGame(false, "Ship destroyed by Boss laser!");
        return;
      }

      // Out of bounds bottom
      if (bossBullet.y > this.app.screen.height + 20) {
        this.app.stage.removeChild(bossBullet);
        bossBullet.destroy();
        this.bossBullets.splice(i, 1);
      }
    }

    // 6. Check Out of Bullets loss condition
    if (this.remainingBullets === 0 && this.playerBullets.length === 0) {
      if (this.currentLevel === 1 && this.cometsHit < 5) {
        this.endGame(false, "Out of ammunition!");
      } else if (this.currentLevel === 2 && this.bossHP > 0) {
        this.endGame(false, "Out of ammunition!");
      }
    }
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

    // Create PIXI.Text for YOU WIN / YOU LOSE as strictly specified in PDF
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

    // Show HTML Modal overlay after brief delay for modal selection
    setTimeout(() => {
      this.uiController.showEndModal(
        isWin,
        isWin ? "VICTORY!" : "GAME OVER",
        description,
        () => this.pushToStart(), // Try Again
        () => {
          this.resetGame();
          this.uiController.showStartButton(true); // Quit
        }
      );
    }, 600);
  }
}
