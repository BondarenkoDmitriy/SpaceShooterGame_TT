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

    // this.createAsteroids();
    this.createRocket();
    this.asteroids = [];
    this.bullets = [];

    window.addEventListener('keydown', this.keysDown);

    // this.update();
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
    setInterval(() => {
      this.createAsteroid();
    }, 1500)
  }

  async createRocket() {
    this.rocket = new Rocket ("../Sprites/rocket.png", this.app.screen.width / 2, this.app.screen.height * 0.9, 0.07);
  }

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
      this.gameStatus('YOU WIN');
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
  this.bullets.forEach((bullet) => {
    this.asteroids.forEach((asteroid, asteroidIndex) => {
      if (this.isCollision(bullet, asteroid.obj)) {
        startGame.app.stage.removeChild(asteroid.obj);
        this.asteroids.splice(asteroidIndex, 1);
        startGame.app.stage.removeChild(bullet);
        this.bullets.splice(this.bullets.indexOf(bullet), 1);
      }
    });
  });
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
    });
  }
}