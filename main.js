import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import { FlyingGhost, GhostSpider, WalkingZombie } from "./ghosts.js";
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
  const gameControlsBtn = document.querySelector("#start-menu__controls");
  const gameTutorial = this.document.querySelector(".game-tutorial");
  const gameTutorialCloseBtn = document.querySelector(".game-tutorial__close");
  const gameControlsDiv = document.querySelector(".game-controls");
  const gameControlsCloseBtn = document.querySelector(".game-controls__close");

  // const GAMESOUND = new Audio();
  // GAMESOUND.src = "assests/Sounds/gameSound.wav";

  function initializeListeners() {
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      startMenu.classList.add("hide");

      prevTime = Date.now();
      animate(0);
    });

    restartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      game.gameRestart();
      prevTime = Date.now();
      animate(0);
    });

    gameDescriptionBtn.addEventListener("click", () => {
      gameTutorial.classList.remove("hide");
    });

    gameControlsBtn.addEventListener("click", () => {
      gameControlsDiv.classList.remove("hide");
    });

    gameTutorialCloseBtn.addEventListener("click", () => {
      gameTutorial.classList.add("hide");
    });

    gameControlsCloseBtn.addEventListener("click", () => {
      gameControlsDiv.classList.add("hide");
    });
  }

  class Game {
    /**
     * @param  {number} width
     * @param  {number} height
     */
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
      this.ghosts = [];
      this.particles = [];
      this.collisions = [];
      this.floatingScores = [];
      this.maxParticles = 100;
      this.ghostTimer = 0;
      this.ghostInterval = 1000;
      this.score = 0;
      this.winningScore = 60;
      this.fontColor = "white";
      this.time = 0;
      this.maxTime = 60000;
      this.gameOver = false;
      this.lives = 100;

      this.sound = new Audio();
      this.sound.src = "assests/Sounds/gameSound1.mp3";
      this.fireballs = [];
      this.frames = 0;
      this.gameOverDiv = document.querySelector(".gameover-menu");
      this.gameScore = document.querySelector(".gameover-menu__score");
      this.gameStatusDiv = document.querySelector(
        ".gameover-menu__game-status"
      );
    }

    update(deltaTime, timeDif) {
      // this.sound.play();
      // this.sound.volume = 0.1;
      console.log("delta time", deltaTime);
      this.time += timeDif;
      // this.time += deltaTime;
      if (this.time > this.maxTime) {
        this.gameOver = true;
      }
      this.background.update();
      this.player.update(this.input.keys, deltaTime);
      //handle ghosts
      if (this.ghostTimer > this.ghostInterval) {
        this.addGhost();
        this.ghostTimer = 0;
      } else {
        this.ghostTimer += deltaTime;
      }
      this.ghosts.forEach((ghost) => {
        ghost.update(deltaTime);
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
      this.ghosts = this.ghosts.filter((ghost) => !ghost.checkForRemove);
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
      this.ghosts = [];
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
      this.fireballs = [];
      this.gameOverDiv.classList.add("hide");
      prevTime = Date.now();
    }

    draw(context) {
      this.background.draw(context);
      this.player.draw(context);
      this.ghosts.forEach((ghost) => {
        ghost.draw(context);
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

    addGhost() {
      if (this.speed > 0 && Math.random() < 0.5)
        this.ghosts.push(new WalkingZombie(this));
      else if (this.speed > 0) this.ghosts.push(new GhostSpider(this));
      this.ghosts.push(new FlyingGhost(this));
    }
  }

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;
  let prevTime;
  initializeListeners();

  function animate(timeStamp) {
    // console.log("timestamp", timeStamp);
    const currentTime = Date.now();
    const timeDif = currentTime - prevTime;
    prevTime = currentTime;

    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime, timeDif);
    game.draw(ctx);
    game.frames++;
    console.log(game.time);
    if (!game.gameOver) {
      requestAnimationFrame(animate);
    }
  }
});
