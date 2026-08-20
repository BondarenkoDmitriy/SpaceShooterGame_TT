import { Game } from './controllers/GameC';

export const startGame = new Game();

const startBtn = document.getElementById('startGameBtn');
if (startBtn) {
  startBtn.addEventListener('click', () => {
    startGame.pushToStart();
  });
}