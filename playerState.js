import { Dust, Fire, Splash } from "./particles.js";

const JUMP = new Audio();
JUMP.src = "assests/jump1.wav";

const CRASH = new Audio();
CRASH.src = "assests/takeHit.wav";

const states = {
  STANDING: 0,
  RUNNING: 1,
  JUMPING: 2,
  FALLING: 3,
  ATTACKING: 4,
  DIVING: 5,
  DAMAGE: 6,
};

class State {
  constructor(state, game) {
    this.state = state;
    this.game = game;
  }
}

export class Standing extends State {
  constructor(game) {
    super("STANDING", game);
  }
  enter() {
    this.game.player.image = document.getElementById("player");
    this.game.player.width = 70;
    this.game.player.frameX = 0;
    this.game.player.frameY = 0;
    this.game.player.maxFrame = 0;
  }
  handleInput(input) {
    if (input.includes("ArrowLeft") || input.includes("ArrowRight")) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes(" ") && this.game.player.energy > 0) {
      this.game.player.setState(states.ATTACKING, 2);
    }
  }
}

export class Running extends State {
  constructor(game) {
    super("RUNNING", game);
  }
  enter() {
    this.game.player.image = document.getElementById("player");
    this.game.player.width = 92;
    this.game.player.height = 69;
    this.game.player.frameX = 2;
    this.game.player.frameY = 4;
    this.game.player.maxFrame = 6;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new Dust(
        this.game,
        this.game.player.x + this.game.player.width * 0.6,
        this.game.player.y + this.game.player.height
      )
    );
    if (input.includes("ArrowDown")) {
      this.game.player.setState(states.STANDING, 0);
    } else if (input.includes("ArrowUp")) {
      this.game.player.setState(states.JUMPING, 1);
    } else if (input.includes(" ") && this.game.player.energy > 0) {
      this.game.player.setState(states.ATTACKING, 2);
    }
  }
}

export class Jumping extends State {
  constructor(game) {
    super("JUMPING", game);
  }
  enter() {
    if (this.game.player.onGround()) this.game.player.vy -= 27;
    this.game.player.image = document.getElementById("player");
    this.game.player.width = 72;
    this.game.player.height = 89;
    this.game.player.frameX = 0;
    this.game.player.frameY = 7;
    this.game.player.maxFrame = 3;
    JUMP.play();
  }
  handleInput(input) {
    if (this.game.player.vy > this.game.player.weight) {
      this.game.player.setState(states.FALLING, 1);
    } else if (input.includes(" ") && this.game.player.energy > 0) {
      this.game.player.setState(states.ATTACKING, 2);
    } else if (input.includes("ArrowDown")) {
      this.game.player.setState(states.DIVING, 0);
    }
  }
}

export class Falling extends State {
  constructor(game) {
    super("FALLING", game);
  }
  enter() {
    this.game.player.image = document.getElementById("player");
    this.game.player.width = 72;
    this.game.player.height = 89;
    this.game.player.frameX = 3;
    this.game.player.maxFrame = 5;
    this.game.player.frameY = 7;
  }
  handleInput(input) {
    if (this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (input.includes("ArrowDown")) {
      this.game.player.setState(states.DIVING, 0);
    }
  }
}

export class Attacking extends State {
  constructor(game) {
    super("ATTACKING", game);
    this.image = document.getElementById("player1");
  }
  enter() {
    this.game.player.image = document.getElementById("player1");
    this.game.player.width = 72;
    this.game.player.height = 90;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 4;
    this.game.player.frameY = 0;
  }

  handleInput(input) {
    this.game.particles.unshift(
      new Fire(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height * 0.5
      )
    );
    if (input.includes(" ") && this.game.player.energy <= 0) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (!input.includes(" ") && this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (!input.includes(" ") && !this.game.player.onGround()) {
      this.game.player.setState(states.FALLING, 1);
    } else if (
      input.includes(" ") &&
      input.includes("ArrowUp") &&
      this.game.player.onGround()
    ) {
      this.game.player.vy -= 27;
    } else if (input.includes("ArrowDown") && !this.game.player.onGround()) {
      this.game.player.setState(states.DIVING, 0);
    }
  }
}

export class Diving extends State {
  constructor(game) {
    super("DIVING", game);
  }
  enter() {
    this.game.player.image = document.getElementById("player1");
    this.game.player.width = 72;
    this.game.player.height = 90;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 4;
    this.game.player.frameY = 0;
    this.game.player.vy = 15;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new Fire(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height * 0.5
      )
    );
    if (this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
      for (let i = 0; i < 30; i++) {
        this.game.particles.unshift(
          new Splash(
            this.game,
            this.game.player.x + this.game.player.width * 0.5,
            this.game.player.y + this.game.player.height
          )
        );
      }
    } else if (input.includes(" ") && this.game.player.onGround()) {
      this.game.player.setState(states.ATTACKING, 2);
    }
  }
}

export class Damage extends State {
  constructor(game) {
    super("DAMAGE", game);
  }
  enter() {
    this.game.player.image = document.getElementById("player");
    this.game.player.width = 90;
    this.game.player.height = 89;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 6;
    this.game.player.frameY = 8;
    CRASH.play();
  }
  handleInput(input) {
    if (this.game.player.frameX >= 6 && this.game.player.onGround()) {
      this.game.player.setState(states.RUNNING, 1);
    } else if (this.game.player.frameX >= 6 && !this.game.player.onGround()) {
      this.game.player.setState(states.FALLING, 1);
    }
  }
}
