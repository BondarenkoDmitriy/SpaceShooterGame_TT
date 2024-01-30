import * as PIXI from 'pixi.js';
import { Game } from './controllers/GameC';


export const startGame = new Game();

// Створення контейнера для куль
// const bulletsContainer = new PIXI.Container();
// app.stage.addChild(bulletsContainer);

// Логіка керування гравцем ----------------------------------------------
// function keyDownHandler(e) {
//   if (e.key === 'ArrowLeft') {
//     player.vx = -5; // Задати швидкість руху гравця вліво
//   } else if (e.key === 'ArrowRight') {
//     player.vx = 5; // Задати швидкість руху гравця вправо
//   }
// }

// Функція для обробки події відпускання клавіші
// function keyUpHandler(e) {
//   if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
//     player.vx = 0; // Зупинити рух гравця при відпусканні клавіші
//   }
// }

// Додати обробники подій клавіш до документа
// document.addEventListener('keydown', keyDownHandler);
// document.addEventListener('keyup', keyUpHandler);

// Оновлення гравця на кожному кадрі

// -------------------------------------------------------------------------

// Логіка стрільби --------------------------------------------------------
function fireBullet() {
  // Створення спрайта пулі
  const bullet = PIXI.Sprite.from("../Sprites/bullet.png");

  // Встановлення початкової позиції пулі на основі позиції гравця
  bullet.position.set(player.x, player.y);

  // Додавання пулі на сцену гри
  app.stage.addChild(bullet);

  // Зміна позиції пулі на кожному кадрі
  app.ticker.add(() => {
    bullet.y -= 5; // Зміщення пулі вгору (залежно від швидкості)
    
    // Перевірка, чи пуля вийшла за межі екрану, тоді її потрібно видалити
    if (bullet.y < 0) {
      app.stage.removeChild(bullet);
    }
  });
}
// --------------------------------------------------------------------

// function moveAsteroids() {
//   // Додати логіку руху астероїдів
// }
//--------------------------------------------------

// Оновлення гри на кожному кадрі

// Функція для перевірки зіткнень між двома спрайтами
function isCollision(sprite1, sprite2) {
  const bounds1 = sprite1.getBounds();
  const bounds2 = sprite2.getBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
         bounds1.x + bounds1.width > bounds2.x &&
         bounds1.y < bounds2.y + bounds2.height &&
         bounds1.y + bounds1.height > bounds2.y;
}

// Запуск анімації
// app.ticker.add(() => {
//   movePlayer();
//   createAsteroid();
//   update();
// });
