import { Game } from './controllers/GameC';

export const startGame = new Game();

document.querySelector('.startGame').addEventListener('click', () => {
  startGame.pushToStart();

  document.querySelector('.startGame').style.display = 'none';
});