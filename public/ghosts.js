class Ghost {
  constructor() {
    this.frameX = 0;
    this.frameY = 0;
    this.fps = 10;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.checkForRemove = false;
  }
  update(deltaTime) {
    this.x -= this.speedX + this.game.speed;
    this.y += this.speedY;
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    //check if off screen
    if (this.x + this.width < 0) this.checkForRemove = true;
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.frameX * this.width,
      0,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

export class FlyingGhost extends Ghost {
  constructor(game) {
    super();
    this.game = game;
    this.width = 87;
    this.height = 72;
    this.x = this.game.width + Math.random() * this.game.width * 0.5;
    this.y = Math.random() * this.game.height * 0.5;
    this.speedX = Math.random() + 1;
    this.speedY = 0;
    this.maxFrame = 5;
    this.image = document.getElementById("flying_ghost");
    this.image1 = document.getElementById("ghost_black");
    this.angle = 0;
    this.va = Math.random() * 0.1 + 0.1; //velocity of angle for angle
    // this.unique = this.game.frames % 1 == 0 ? true : false;
    this.unique = Math.random() > 0.85 ? true : false;
  }
  update(deltaTime) {
    super.update(deltaTime);
    //for every animation frame increase the value of angle by velocity of angle
    this.angle += this.va;
    //add the velocity of angle to the y position and use Math.sin for wavy movement
    this.y += Math.sin(this.angle);
  }

  draw(context) {
    super.draw(context);
    if (this.unique) {
      context.drawImage(
        this.image1,
        this.frameX * this.width,
        0,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
}

export class WalkingZombie extends Ghost {
  constructor(game) {
    super();
    this.game = game;
    this.width = 125;
    this.height = 175;
    this.x = this.game.width;
    this.y = this.game.height - this.height - this.game.groundMargin;
    this.image = document.getElementById("ghost_zombie");
    this.speedX = 1;
    this.speedY = 0;
    this.maxFrame = 7;
  }
}

export class GroundZombie extends Ghost {
  constructor(game) {
    super();
    this.game = game;
    this.width = 55.6;
    this.height = 80;
    this.x = this.game.width;
    this.y = this.game.height - this.height - this.game.groundMargin;
    this.image = document.getElementById("ground_zombie");
    this.speedX = 0;
    this.speedY = 0;
    this.maxFrame = 7;
  }
}

export class GhostSpider extends Ghost {
  constructor(game) {
    super();
    this.game = game;
    this.width = 120;
    this.height = 144;
    this.x = this.game.width;
    this.y = Math.random() * this.game.height * 0.5;
    this.image = document.getElementById("ghost_spider_big");
    this.speedX = 0;
    this.speedY = Math.random() > 0.5 ? 1 : -1;
    this.maxFrame = 5;
  }
  update(deltaTime) {
    super.update(deltaTime);
    if (this.y > this.game.height - this.height - this.game.groundMargin)
      this.speedY *= -1;
    if (this.y < -this.height) this.checkForRemove = true;
  }
  draw(context) {
    super.draw(context);
    //drawing spider web
    context.beginPath();
    context.moveTo(this.x + this.width / 2, 0);
    context.lineTo(this.x + this.width / 2, this.y + 50);
    context.stroke();
  }
}
