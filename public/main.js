import { Player } from "./player.js";
import { InputHandler } from "./input.js";
import { Background } from "./background.js";
import {
  FlyingGhost,
  GhostSpider,
  WalkingZombie,
  GroundZombie,
} from "./ghosts.js";
import { UI } from "./UI.js";

//loads after loading DOM.
window.addEventListener("load", function () {
  //CANVAS
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 1500;
  canvas.height = 500;

  //getting DOM elements.
  const startMenu = document.querySelector(".start-menu");
  const startBtn = document.querySelector("#start-menu__play");
  const restartBtn = document.querySelector("#restart");
  const gameDescriptionBtn = document.querySelector("#start-menu__description");
  const gameControlsBtn = document.querySelector("#start-menu__controls");
  const gameTutorial = this.document.querySelector(".game-tutorial");
  const gameTutorialCloseBtn = document.querySelector(".game-tutorial__close");
  const gameControlsDiv = document.querySelector(".game-controls");
  const gameControlsCloseBtn = document.querySelector(".game-controls__close");
  const loading = document.querySelector(".loading");

  // const GAMESOUND = new Audio();
  // GAMESOUND.src = "assests/Sounds/gameSound.wav";

  function getHighScore() {
    fetch("http://localhost:3001/highscore")
      .then((data) => {
        return data.json();
      })
      .then((parsedData) => {
        loading.classList.add("hide");
        startMenu.classList.add("hide");

        game.highScore = +parsedData.highscore;
        animate(0);
      })
      .catch((err) => {
        alert("couldnot fetch high score!!!");
        startMenu.classList.add("hide");

        loading.classList.add("hide");

        game.highScore = 999;
        animate(0);
      });
  }
  //Initializing all the listeners
  function initializeListeners() {
    //Runs Game after pressing on start button.
    startBtn.addEventListener("click", (e) => {
      e.preventDefault();
      prevTime = Date.now();
      // console.log("testing", sgame.highScore);
      loading.classList.remove("hide");
      getHighScore();
    });

    //resets the game after pressing on restart button
    restartBtn.addEventListener("click", (e) => {
      e.preventDefault();
      game.gameRestart();
      prevTime = Date.now();
      getHighScore();
    });

    //displays the game tutorial information
    gameDescriptionBtn.addEventListener("click", () => {
      gameTutorial.classList.remove("hide");
    });

    //displays the game controls information
    gameControlsBtn.addEventListener("click", () => {
      gameControlsDiv.classList.remove("hide");
    });

    //closes the game tutorial information
    gameTutorialCloseBtn.addEventListener("click", () => {
      gameTutorial.classList.add("hide");
    });

    //closes the game controls information
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
      //state of the game
      this.gameState = {
        currentState: 0,
        startState: 1,
        playingState: 2,
        overState: 3,
      };

      this.width = width;
      this.height = height;
      this.groundMargin = 20;

      this.speed = 0;
      this.maxSpeed = 3;

      this.background = new Background(this);
      this.player = new Player(this); //instance of Player Class
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
      this.input = new InputHandler(this);
      this.UI = new UI(this);

      this.ghosts = [];
      this.particles = [];
      this.collisions = [];
      this.floatingScores = [];
      this.fireballs = [];

      this.maxParticles = 100;

      this.ghostTimer = 0;
      this.ghostInterval = 1000;

      this.score = 0;
      this.winningScore = 60;
      this.highScore = 0;

      this.fontColor = "white";

      this.time = 0;
      this.maxTime = 60000;

      this.gameOver = false;

      this.lives = 100;

      this.sound = new Audio();
      this.sound.src = "assests/Sounds/gameSound1.mp3";

      this.frames = 0;

      this.gameOverDiv = document.querySelector(".gameover-menu");
      this.gameScore = document.querySelector(".gameover-menu__score");
      this.gameStatusDiv = document.querySelector(
        ".gameover-menu__game-status"
      );
      this.gameHighScore = document.querySelector(".gameover-menu__highScore");
    }

    //Updates all the animations
    update(deltaTime, timeDif) {
      this.time += timeDif;
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

      //calling ghosts update method everytime
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

      //Remove ghosts, particles,collisions and floatingScores if checkfor remove is true.
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

    //game reset function
    gameRestart() {
      this.ghosts = [];
      this.particles = [];
      this.collisions = [];
      this.floatingScores = [];

      this.speed = 0;
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

    //draws all the animations
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

    //ghost adding function
    addGhost() {
      //when math.random is less than 0.5 add walking zombie
      if (this.speed > 0 && Math.random() < 0.5)
        this.ghosts.push(new WalkingZombie(this));
      else if (this.speed > 0 && Math.random() > 0.7)
        this.ghosts.push(new GroundZombie(this));
      //else add ghost spider
      else if (this.speed > 0) this.ghosts.push(new GhostSpider(this));
      this.ghosts.push(new FlyingGhost(this));
    }
  }

  //Game Object
  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;
  let prevTime;
  initializeListeners();

  //animation function
  function animate(timeStamp) {
    const currentTime = Date.now();
    const timeDif = currentTime - prevTime;
    prevTime = currentTime;

    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime, timeDif);
    game.draw(ctx);
    game.frames++;

    if (!game.gameOver) {
      //loops animate function
      game.sound.play();
      game.sound.volume = 0.1;
      requestAnimationFrame(animate);
    }
  }
});
