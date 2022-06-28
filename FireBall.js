export default class FireBall {
  /**
   * @param  {Game} game
   * @param  {number} x
   * @param  {number} y
   * @param  {number} w
   * @param  {number} h
   */

  constructor(game, x, y, w, h) {
    this.game = game;
    this.sourceX = 0;
    this.sourceY = 0;
    this.sourceWidth = 80;
    this.sourceHeight = 45;
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.image = document.getElementById("fireball");
    this.checkForRemove = false;
  }
  /**
   * Draws the fireball on the canvas
   * @param  {Context} ctx
   */
  draw(ctx) {
    ctx.drawImage(
      this.image,
      this.sourceX,
      this.sourceY,
      this.sourceWidth,
      this.sourceHeight,
      this.x,
      this.y + 10,
      80,
      45
    );
  }
  /**
   * updates the position of the fireball and removes the fireball
   * if x position of fireball is larger than canvas width
   */
  update() {
    this.x += 15;
    if (this.x + this.width > this.game.width) this.checkForRemove = true;
  }
}
