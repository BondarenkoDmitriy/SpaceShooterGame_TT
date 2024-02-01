import * as PIXI from 'pixi.js';
import { Character } from './CharacterC';
import { Rocket } from './RocketC';
import { startGame } from '../index';
import { UIController } from './UIC';

export class Game {
  constructor() {
    this.app = new PIXI.Application({ width: 1280, height: 720 });
    document.getElementById('GameContainer').appendChild(this.app.view);

    this.uiController = new UIController();

    this.setBackground("../../Sprites/space.png");

    // this.createAsteroids();
    this.createRocket();
    this.asteroids = [];
    this.bullets = [];

    this.bossHitCount = 0;
    // this.initHealthBar();

    window.addEventListener('keydown', this.keysDown);

    // this.update();
  }

  setBackground(imagePath) {
    if (!this.backgroundTexture) {
        this.backgroundTexture = PIXI.Texture.from(imagePath);
        this.background = new PIXI.Sprite(this.backgroundTexture);
        this.background.width = this.app.screen.width;
        this.background.height = this.app.screen.height;
        this.app.stage.addChild(this.background);
    } else {
        this.background.texture = PIXI.Texture.from(imagePath);
    }
}

  pushToStart() {
    this.createAsteroids();
    this.update();
    this.startCountdown();
  }

  movePlayer() {
    player.x += player.x;
  
    if (player.x < 0) {
      player.x = 0;
    } else if (player.x > app.screen.width) {
      player.x = app.screen.width;
    }
  }

  createAsteroid() {
    this.asteroid = new Character("../Sprites/comet.png", Math.random() * Math.abs(this.app.screen.width) * 0.8, this.app.screen.height * 0.01);
    this.asteroids.push(this.asteroid);

    this.asteroid.move(this.asteroid.x, this.app.screen.height, 2);
  }

  createAsteroids() {
    this.asteroidInterval = setInterval(() => {
      this.createAsteroid();
    }, 1500)
  }

  stopAsteroids() {
      clearInterval(this.asteroidInterval);
  }

  async createRocket() {
    this.rocket = new Rocket ("../Sprites/rocket.png", this.app.screen.width / 2, this.app.screen.height * 0.9, 0.07);
  }

  createBoss() {
    this.boss = new Character("../../Sprites/boss.png", Math.random() * Math.abs(this.app.screen.width) * 0.5, this.app.screen.height * 0.3, 0.25);
   
    // this.healthBarEmpty.classList.add('visible');
    // this.boss.move(this.app.screen.width, this.app.screen.height * 0.3, 2);
  }

  // initHealthBar() {
  //   this.healthBarEmpty = document.getElementById('healthBarStatusEmpty');
  //   this.healthBarFull = document.getElementById('healthBarStatusFull');

  //   this.maxBossHitCount = 4;
  //   this.bossHitCount = 0;
  //   this.initialHealthBarWidth = this.healthBarEmpty.offsetWidth;
  //   this.healthBarFull.style.width = this.initialHealthBarWidth + 'px';
  // }

  // updateHealthBar() {
  //   const healthPercentage = (this.maxBossHitCount - this.bossHitCount) / this.maxBossHitCount * 100;
  //   const newWidth = this.initialHealthBarWidth * healthPercentage / 100;
  //   this.healthBarFull.style.width = newWidth + 'px';
  // }

  // checkBossHit() {
  //   this.bossHitCount++;
  //   this.updateHealthBar();

  //   if (this.bossHitCount >= this.maxBossHitCount) {
  //     this.gameStatus('YOU WIN');
  //   }
  // }

  fireBullet() {
    if (this.uiController) {

      this.uiController.decreaseBulletCount();
    }

    if (this.bullets.length >= 10) {
      this.gameStatus('YOU LOSE');
      return;
    }

    const bullet = PIXI.Sprite.from("../Sprites/bullet.png");
    bullet.scale.set(0.03);
    bullet.position.set(this.rocket.obj.x - this.rocket.obj.width / 8, this.rocket.obj.y - this.rocket.obj.height / 2);
    startGame.app.stage.addChild(bullet);
  
    this.bullets.push(bullet);

    startGame.app.ticker.add(() => {
    bullet.y -= 8;

    if (bullet.y < 0) {
      startGame.app.stage.removeChild(bullet);
    }
  });
}

isCollision(sprite1, sprite2) {
  const bounds1 = sprite1.getBounds();
  const bounds2 = sprite2.getBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
}

gameStatus(message) {
  startGame.app.ticker.stop();

  const gameStatusElement = document.querySelector('.gameStatus');
  gameStatusElement.textContent = message;

  if (message === 'YOU LOSE') {
    gameStatusElement.style.color = 'red';
  } else if (message === 'YOU WIN') {
    gameStatusElement.style.color = 'green';
  }

  gameStatusElement.style.opacity = '1';
}

collideWithAsteroid() {
  const counterComets = () => {
    const cometsElement = document.querySelector('.comets');
    const currentComets = parseInt(cometsElement.textContent.split('/')[1]);
    const updatedComets = Math.min(currentComets + 1, 5);
    cometsElement.textContent = `Comets: 5/${updatedComets}`;

    if (updatedComets === 5) {
      this.setBackground("../../Sprites/boss_location.png");

      this.stopAsteroids();

      this.createBoss();
    }
  };

  this.asteroids.forEach((asteroid) => {
    if (this.isCollision(this.rocket.obj, asteroid.obj)) {
      this.gameStatus('YOU LOSE');
      return;
    }
    this.bullets.forEach((bullet, bulletIndex) => {
      if (this.isCollision(bullet, asteroid.obj)) {
        counterComets();
        startGame.app.stage.removeChild(asteroid.obj);
        this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
        startGame.app.stage.removeChild(bullet);
        this.bullets.splice(bulletIndex, 1);
      }
    });
  });
}

collideWithBullet() {
  for (let bulletIndex = this.bullets.length - 1; bulletIndex >= 0; bulletIndex--) {
    const bullet = this.bullets[bulletIndex];
    for (let asteroidIndex = this.asteroids.length - 1; asteroidIndex >= 0; asteroidIndex--) {
      const asteroid = this.asteroids[asteroidIndex];
      if (this.isCollision(bullet, asteroid.obj)) {
        startGame.app.stage.removeChild(asteroid.obj);
        this.asteroids.splice(asteroidIndex, 1);
        startGame.app.stage.removeChild(bullet);
        this.bullets.splice(bulletIndex, 1);
        break;
      }
    }

    if (!bullet) continue;
    if (this.boss && this.isCollision(bullet, this.boss.obj)) {
      this.bossHitCount++;
      startGame.app.stage.removeChild(bullet);
      this.bullets.splice(bulletIndex, 1);

      if (this.bossHitCount >= 4) {
        startGame.app.stage.removeChild(this.boss.obj);
        this.boss = null;
        setTimeout(() => {
          this.gameStatus('YOU WIN');
        }, 500);
      }
    }
  }
}

startCountdown() {
  let timeLeft = 60;
  const timerElement = document.getElementById('timer');
  
  const countdownInterval = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time: ${timeLeft}`;
    
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      this.gameStatus('YOU LOSE');
      return;
    }
  }, 1000);
}

  keysDown = (e) => {
    if (e.keyCode === 32) {
      this.fireBullet();
    } 
  }

  update() {
    this.app.ticker.add(() => {
      this.collideWithAsteroid();
      this.collideWithBullet();
      // this.checkBossHit();
    });
  }
}