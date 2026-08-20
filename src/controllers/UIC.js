export class UIController {
  constructor() {
    this.taskElement = document.getElementById('taskObjective');
    this.bulletElement = document.getElementById('bulletCount');
    this.cometElement = document.getElementById('cometCount');
    this.timerElement = document.getElementById('timer');
    this.startGameBtn = document.getElementById('startGameBtn');
    
    this.modalOverlay = document.getElementById('endGameModal');
    this.modalTitle = document.getElementById('modalTitle');
    this.modalDesc = document.getElementById('modalDesc');
    this.btnTryAgain = document.getElementById('btnTryAgain');
    this.btnQuit = document.getElementById('btnQuit');
  }

  setTask(text) {
    if (this.taskElement) {
      this.taskElement.textContent = text;
    }
  }

  setBullets(count, max = 10) {
    if (this.bulletElement) {
      this.bulletElement.textContent = `Bullets: ${count}/${max}`;
    }
  }

  setAsteroids(count, max = 5) {
    if (this.cometElement) {
      this.cometElement.textContent = `Asteroids: ${count}/${max}`;
    }
  }

  setBossHP(count, max = 4) {
    if (this.cometElement) {
      this.cometElement.textContent = `Boss: ${count}/${max} HP`;
    }
  }

  setTimer(seconds) {
    if (this.timerElement) {
      this.timerElement.textContent = `Time: ${seconds}s`;
    }
  }

  showStartButton(visible) {
    if (this.startGameBtn) {
      this.startGameBtn.style.display = visible ? 'block' : 'none';
    }
  }

  showEndModal(isWin, title, description, onTryAgain, onQuit) {
    if (!this.modalOverlay) return;

    this.modalTitle.textContent = title;
    this.modalTitle.className = `modal-title ${isWin ? 'win' : 'lose'}`;
    this.modalDesc.textContent = description;

    this.modalOverlay.style.display = 'flex';

    // Clear previous event listeners using clone or direct assignment
    const newTryAgain = this.btnTryAgain.cloneNode(true);
    const newQuit = this.btnQuit.cloneNode(true);
    this.btnTryAgain.parentNode.replaceChild(newTryAgain, this.btnTryAgain);
    this.btnQuit.parentNode.replaceChild(newQuit, this.btnQuit);
    this.btnTryAgain = newTryAgain;
    this.btnQuit = newQuit;

    this.btnTryAgain.addEventListener('click', () => {
      this.hideEndModal();
      if (onTryAgain) onTryAgain();
    });

    this.btnQuit.addEventListener('click', () => {
      this.hideEndModal();
      if (onQuit) onQuit();
    });
  }

  hideEndModal() {
    if (this.modalOverlay) {
      this.modalOverlay.style.display = 'none';
    }
  }
}

