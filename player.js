import {
  Standing,
  Running,
  Jumping,
  Falling,
  Attacking,
  Diving,
  Damage,
} from "./playerState.js";

import { CollisionAnimation } from "./collisionAnimation.js";
import { FloatingScore } from "./floatingScore.js";
import FireBall from "./FireBall.js";

const ATTACK = new Audio();
ATTACK.src = "assests/Sounds/TailWhip.flac";

const fireBallAttack = new Audio();
fireBallAttack.src = "assests/Sounds/nutfall.flac";

export class Player {
  /**
   * @param  {Game} game
   */
  constructor(game) {
    this.game = game;
    this.width = 70;
    this.height = 80;
    this.x = 0;
    this.y = this.game.height - this.height - this.game.groundMargin; // on player at bottom.
    this.vy = 0;
    this.weight = 1;
    this.image = document.getElementById("player");
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.speed = 0;
    this.maxSpeed = 10;
    this.energy = 100;
    this.states = [
      new Standing(this.game),
      new Running(this.game),
      new Jumping(this.game),
      new Falling(this.game),
      new Attacking(this.game),
      new Diving(this.game),
      new Damage(this.game),
    ];
    this.currentState = null;
    this.cooldown = false;
  }
  //input is the key pressed by the player
  update(input, deltaTime) {
    this.checkCollison();
    this.currentState.handleInput(input);
    //horizontal movement
    /* This is the code for the horizontal movement of the player. */
    this.x += this.speed;
    if (input.includes("ArrowRight") && this.currentState !== this.states[6])
      this.speed = this.maxSpeed;
    else if (
      input.includes("ArrowLeft") &&
      this.currentState !== this.states[6]
    )
      this.speed = -this.maxSpeed;
    else this.speed = 0;
    // horizontal boundaries
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width)
      this.x = this.game.width - this.width;
    //vertical movement
    this.y += this.vy;
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;

    //vertical boundaries
    if (this.y > this.game.height - this.height - this.game.groundMargin)
      this.y = this.game.height - this.height - this.game.groundMargin;

    //animate the sprite around every 50 milliseconds
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    // extra
    this.game.fireballs.forEach((fireball, idx) => {
      fireball.update();

      this.game.ghosts.forEach((ghost, ghostIdx) => {
        if (
          ghost.x < fireball.x + fireball.width &&
          ghost.x + ghost.width > fireball.x &&
          ghost.y < fireball.y + fireball.height &&
          ghost.y + ghost.height > fireball.y
        ) {
          fireBallAttack.play();
          ghost.checkForRemove = true;

          // Unique ghosts
          if (ghost.unique) {
            this.game.time = this.game.time > 2000 ? this.game.time - 2000 : 0;
          }
          this.game.collisions.push(
            new CollisionAnimation(
              this.game,
              ghost.x + ghost.width * 0.5,
              ghost.y + ghost.height * 0.5
            )
          );
          this.game.ghosts.splice(ghostIdx, 1);
          this.game.fireballs.splice(idx, 1);
          this.game.score++;
          this.game.floatingScores.push(
            new FloatingScore("+1 Score", ghost.x, ghost.y, 0, 0)
          );
        }
      });
    });

    // Handle Fireball
    this.game.fireballs = this.game.fireballs.filter(
      (fireball) => !fireball.checkForRemove
    );

    if (input.includes("r") && !this.cooldown) {
      this.game.fireballs.push(
        new FireBall(this.game, this.x, this.y, this.weight, this.height)
      );
      if (this.energy > 0) {
        this.energy -= 5;
      }
      this.cooldown = true;
      setTimeout(() => {
        this.cooldown = false;
      }, 500);
    }

    if (
      this.currentState !== this.states[4] &&
      this.energy < 100 &&
      this.game.frames % 50 === 0
    ) {
      this.energy += 5;
      //after main loop runs 10 time in rolling state decrease the energy by 1.
    } else if (
      this.currentState === this.states[4] &&
      this.energy > 0 &&
      this.game.frames % 10 === 0
    ) {
      this.energy -= 5;
    }
  }

  draw(context) {
    context.drawImage(
      this.image,
      this.frameX * this.width,
      this.frameY * this.height,
      this.width,
      this.height,
      this.x,
      this.y,
      this.width,
      this.height
    );
    this.game.fireballs.forEach((fireball) => {
      fireball.draw(context);
    });
  }
  onGround() {
    return this.y >= this.game.height - this.height - this.game.groundMargin;
  }

  //state comes from handleInput in playerState.js
  //speed is to adjust the background speed when player is in different state.
  setState(state, speed) {
    this.currentState = this.states[state];
    //speed is different in different sprite animations
    this.game.speed = this.game.maxSpeed * speed;
    //enters the corresponding method of the playerState.
    this.currentState.enter();
  }
  checkCollison() {
    this.game.ghosts.forEach((ghost) => {
      if (
        ghost.x < this.x + this.width &&
        ghost.x + ghost.width > this.x &&
        ghost.y < this.y + this.height &&
        ghost.y + ghost.height > this.y
      ) {
        //collision detected
        ghost.checkForRemove = true;

        // Unique ghosts
        if (ghost.unique) {
          this.game.time = this.game.time > 2000 ? this.game.time - 2000 : 0;
        }
        this.game.collisions.push(
          new CollisionAnimation(
            this.game,
            ghost.x + ghost.width * 0.5,
            ghost.y + ghost.height * 0.5
          )
        );
        if (
          this.currentState === this.states[4] ||
          this.currentState === this.states[5]
        ) {
          this.game.score++;
          this.game.floatingScores.push(
            new FloatingScore("+1 Score", ghost.x, ghost.y, 0, 0)
          );
          ATTACK.play();
        } else {
          this.setState(6, 0);
          if (!this.game.score <= 0) this.game.score -= 1;
          this.game.lives -= 20;
          if (this.game.lives <= 0) {
            fetch("http://localhost:3000/highscore", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                score: this.game.score,
              }),
            }).then((resp) => {
              this.game.gameOver = true;
              console.log("response received", resp);
            });
          }
        }
      }
    });
  }
}
