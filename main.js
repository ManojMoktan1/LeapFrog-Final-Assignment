import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingGhost, GhostSpider, WalkingZombie } from "./enemies.js";
import { UI } from "./UI.js";

window.addEventListener("load", function () {
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;
  // canvas.width = window.innerWidth;
  // canvas.height = window.innerHeight;
  const startMenu = document.querySelector(".start-menu");
  const startBtn = document.querySelector("#start-menu__play");
  const restartBtn = document.querySelector("#restart");
  const gameDescriptionBtn = document.querySelector("#start-menu__description");
  const gameTutorial = this.document.querySelector(".game-tutorial");
  const gameTutorialCloseBtn = document.querySelector(".game-tutorial__close");

  // const GAMESOUND = new Audio();
  // GAMESOUND.src = "assests/gameSound.wav";

  function initializeListeners() {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startMenu.classList.add("hide");
      animate(0);
    });

    restartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      game.gameOverDiv.style.display = "none";
      game.gameRestart();
      animate(0);
    });

    gameDescriptionBtn.addEventListener("click", () => {
      gameTutorial.classList.remove("hide");
    });

    gameTutorialCloseBtn.addEventListener("click", () => {
      gameTutorial.classList.add("hide");
    });
  }

  class Game {
    constructor(width, height) {
      this.gameState = {
        currentState: 0,
        startState: 1,
        playingState: 2,
        overState: 3,
      };

      this.width = width;
      this.height = height;
      this.groundMargin = 30;
      this.speed = 0;
      this.maxSpeed = 3;
      this.background = new Background(this);
      this.player = new Player(this);
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
      this.input = new InputHandler(this);
      this.UI = new UI(this);
      this.enemies = [];
      this.particles = [];
      this.collisions = [];
      this.floatingScores = [];
      this.maxParticles = 100;
      this.enemyTimer = 0;
      this.enemyInterval = 1000;
      this.score = 0;
      this.winningScore = 0;
      this.fontColor = "white";
      this.time = 0;
      this.maxTime = 50000;
      this.gameOver = false;
      this.lives = 100;

      this.sound = new Audio();
      this.sound.src = "assests/gameSound1.mp3";
      this.fireballs = [];
      this.frames = 0;
      this.gameOverDiv = document.querySelector(".gameover-menu");
      this.gameScore = document.querySelector(".gameover-menu__score");
    }

    update(deltaTime) {
      // this.sound.play();
      // this.sound.volume = 0.1;

      this.time += deltaTime;
      if (this.time > this.maxTime) this.gameOver = true;
      this.background.update();
      this.player.update(this.input.keys, deltaTime);
      //handle enemies
      if (this.enemyTimer > this.enemyInterval) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        this.enemyTimer += deltaTime;
      }
      this.enemies.forEach((enemy) => {
        enemy.update(deltaTime);
      });
      //handle messages
      this.floatingScores.forEach((message) => {
        message.update();
      });

      //handle particles
      this.particles.forEach((particle, index) => {
        particle.update();
      });
      if (this.particles.length > this.maxParticles) {
        this.particles.length = this.maxParticles;
      }
      //handle collision sprites
      this.collisions.forEach((collision, index) => {
        collision.update(deltaTime);
      });
      this.enemies = this.enemies.filter((enemy) => !enemy.checkForRemove);
      this.particles = this.particles.filter(
        (particle) => !particle.checkForRemove
      );
      this.collisions = this.collisions.filter(
        (collision) => !collision.checkForRemove
      );
      this.floatingScores = this.floatingScores.filter(
        (message) => !message.checkForRemove
      );
    }

    gameRestart() {
      this.speed = 0;
      this.enemies = [];
      this.particles = [];
      this.collisions = [];
      this.floatingScores = [];
      this.score = 0;
      this.time = 0;
      this.gameOver = false;
      this.lives = 100;
      this.player = new Player(this);
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
    }

    draw(context) {
      this.background.draw(context);
      this.player.draw(context);
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      this.collisions.forEach((collision) => {
        collision.draw(context);
      });
      this.floatingScores.forEach((message) => {
        message.draw(context);
      });

      this.UI.draw(context);
    }

    addEnemy() {
      if (this.speed > 0 && Math.random() < 0.5)
        this.enemies.push(new WalkingZombie(this));
      else if (this.speed > 0) this.enemies.push(new GhostSpider(this));
      this.enemies.push(new FlyingGhost(this));
    }
  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;
  initializeListeners();

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    game.frames++;
    if (!game.gameOver) {
      requestAnimationFrame(animate);
    }
  }
});
