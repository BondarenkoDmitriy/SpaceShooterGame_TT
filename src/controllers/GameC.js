import * as PIXI from 'pixi.js';
import { Character } from './CharacterC';

export class Game {
  constructor() {
    this.app = new PIXI.Application({ width: 1280, height: 720 });
    document.getElementById('GameContainer').appendChild(this.app.view);
    console.log('hey');
    // movePlayer();
    this.createAsteroids();
    this.createRocket();
    this.asteroids = [];
    this.buletts = [];
    // createCharacter();
  }

  movePlayer() {
    // Зміна позиції гравця відповідно до його швидкості
    player.x += player.x;
  
    // Обмеження руху гравця в межах екрану
    if (player.x < 0) {
      player.x = 0;
    } else if (player.x > app.screen.width) {
      player.x = app.screen.width;
    }
  }

  createAsteroid() {
    this.asteroid = new Character("../Sprites/comet.png", Math.random() * (this.app.screen.width * 0.8), this.app.screen.height * 0.01);
    this.asteroids.push(this.asteroid);

    this.asteroid.move(this.asteroid.x, this.app.screen.height, 2);
  }

  createAsteroids() {
    setInterval(() => {
      this.createAsteroid();
    }, 1500)
  }

  async createRocket() {
    this.rocket = new Character("../Sprites/rocket.png", this.app.screen.width / 2, this.app.screen.height * 0.9, 0.07);
  }

  update() {
    // Перевірка зіткнень пуль з астероїдами
    for (let i = 0; i < bulletsContainer.children.length; i++) {
      const bullet = bulletsContainer.children[i];
  
      // Перевірка зіткнень кожної пулі з кожним астероїдом
      for (let j = 0; j < app.stage.children.length; j++) {
        const asteroid = app.stage.children[j];
  
        // Перевірка на зіткнення
        if (isCollision(bullet, asteroid)) {
          // Видалення пулі та астероїда з сцени
          bulletsContainer.removeChild(bullet);
          app.stage.removeChild(asteroid);
          
          // Оновлення очків або іншої логіки гри
          // updateGameLogic();
        }
      }
    }
  }
}