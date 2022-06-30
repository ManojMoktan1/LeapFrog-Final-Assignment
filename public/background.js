class Layer {
  /**
   * @param  {Game} game
   * @param  {number} width
   * @param  {number} height
   * @param  {number} speedModifier
   * @param  {Image} image*/
  constructor(game, width, height, speedModifier, image) {
    this.game = game;
    this.width = width;
    this.height = height;
    this.speedModifier = speedModifier;
    this.image = image;
    this.x = 0;
    this.y = 0;
  }
  update() {
    //move the background to the left until its full width and set its value to 0.
    if (this.x < -this.width) this.x = 0;
    else this.x -= this.game.speed * this.speedModifier;
  }
  draw(context) {
    //draw two same images. one starting from x= 0 and other from the end of the first image.
    context.drawImage(this.image, this.x, this.y, this.width, this.height);
    context.drawImage(
      this.image,
      this.x + this.width,
      this.y,
      this.width,
      this.height
    );
  }
}

export class Background {
  /**
   * @param  {Game} game
   */
  constructor(game) {
    this.game = game;
    this.width = 1667;
    // this.width = this.height = this.game.height;
    this.height = 500;
    this.layer4image = document.getElementById("layer4");
    this.layer5image = document.getElementById("layer5");
    //instance of Layer class
    this.layer4 = new Layer(
      this.game,
      this.width,
      this.height,
      0.4,
      this.layer4image
    );
    this.layer5 = new Layer(
      this.game,
      this.width,
      this.height,
      1,
      this.layer5image
    );
    this.backgroundLayers = [this.layer4, this.layer5];
  }
  update() {
    //looping through all the layers and calling update method for every layer
    this.backgroundLayers.forEach((layer) => {
      layer.update();
    });
  }
  draw(context) {
    //looping through all the layers and calling draw method for every layer
    this.backgroundLayers.forEach((layer) => {
      layer.draw(context);
    });
  }
}
