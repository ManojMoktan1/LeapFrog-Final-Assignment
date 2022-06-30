export class FloatingScore {
  /**
   * @param  {number} value
   * @param  {number} x
   * @param  {number} y
   * @param  {number} targetX
   * @param  {number} targetY
   */
  constructor(value, x, y, targetX, targetY) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.targetX = targetX;
    this.targetY = targetY;
    this.checkForRemove = false;
    this.timer = 0;
  }
  update() {
    this.x += this.targetX - this.x * 0.03;
    this.y += this.targetY - this.y * 0.03;
    this.timer++;
    if (this.timer > 100) this.checkForRemove = true;
  }
  draw(context) {
    context.font = "22px Creepster";
    context.fillStyle = "white";
    context.fillText(this.value, this.x, this.y);
  }
}
