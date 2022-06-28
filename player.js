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
ATTACK.src = "assests/TailWhip.flac";

export class Player {
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
      this.y = this.game.height - this.height - this.game.groundMargin; //sprite animation
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

      this.game.enemies.forEach((enemy, enemyIdx) => {
        if (
          enemy.x < fireball.x + fireball.width &&
          enemy.x + enemy.width > fireball.x &&
          enemy.y < fireball.y + fireball.height &&
          enemy.y + enemy.height > fireball.y
        ) {
          // console.log("testing");
          // if (enemy.unique) {
          //   this.game.time -= 100;
          // }
          enemy.checkForRemove = true;

          // Unique enemies
          if (enemy.unique) {
            this.game.time = this.game.time > 2000 ? this.game.time - 2000 : 0;
          }
          this.game.collisions.push(
            new CollisionAnimation(
              this.game,
              enemy.x + enemy.width * 0.5,
              enemy.y + enemy.height * 0.5
            )
          );
          this.game.enemies.splice(enemyIdx, 1);
          this.game.fireballs.splice(idx, 1);
          this.game.score++;
          this.game.floatingScores.push(
            new FloatingScore("+1 Score", enemy.x, enemy.y, 0, 0)
          );
        }
      });
    });
    this.game.fireballs = this.game.fireballs.filter(
      (fireball) => !fireball.checkForRemove
    );

    //extra
    if (input.includes("r") && !this.cooldown) {
      this.game.fireballs.push(
        new FireBall(this.game, this.x, this.y, this.weight, this.height)
      );
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
    console.log(this.energy);
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

  setState(state, speed) {
    this.currentState = this.states[state];
    this.game.speed = this.game.maxSpeed * speed;
    this.currentState.enter();
  }
  checkCollison() {
    this.game.enemies.forEach((enemy) => {
      if (
        enemy.x < this.x + this.width &&
        enemy.x + enemy.width > this.x &&
        enemy.y < this.y + this.height &&
        enemy.y + enemy.height > this.y
      ) {
        //collision detected
        enemy.checkForRemove = true;

        // Unique enemies
        if (enemy.unique) {
          this.game.time = this.game.time > 2000 ? this.game.time - 2000 : 0;
        }
        this.game.collisions.push(
          new CollisionAnimation(
            this.game,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
        if (
          this.currentState === this.states[4] ||
          this.currentState === this.states[5]
        ) {
          this.game.score++;
          this.game.floatingScores.push(
            new FloatingScore("+1 Score", enemy.x, enemy.y, 0, 0)
          );
          ATTACK.play();
        } else {
          this.setState(6, 0);
          if (!this.game.score <= 0) this.game.score -= 1;
          this.game.lives -= 20;
          if (this.game.lives <= 0) this.game.gameOver = true;
        }
      }
    });
  }
}
