export class UIController {
  constructor() {
    this.bulletCountElement = document.querySelector('.bullet');
    this.bulletCount = 10;
    this.updateBulletCount();
  }

  updateBulletCount() {
    this.bulletCountElement.textContent = `Score: 10/${this.bulletCount}`;
  }

  decreaseBulletCount() {
    if (this.bulletCount > 0) {
      this.bulletCount--;
      this.updateBulletCount();
    }
  }
}
