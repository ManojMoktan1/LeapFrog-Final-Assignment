const GAMEWIN = new Audio();
GAMEWIN.src = "assests/Sounds/gamComplete.wav";

const GAMEOVER = new Audio();
GAMEOVER.src = "assests/Sounds/gamOver.wav";

export class UI {
  constructor(game) {
    this.game = game;
    this.fontSize = 30;
    this.fontFamily = "Creepster";
    this.livesImage = document.getElementById("lives");
  }
  draw(context) {
    context.save();

    context.font = this.fontSize + "px " + this.fontFamily;
    context.textAlign = "left";
    context.fillStyle = this.game.fontColor;
    //score
    context.fillText("SCORE: " + this.game.score, 20, 50);
    //timer
    context.font = this.fontSize * 0.8 + "px " + this.fontFamily;
    context.fillText(
      "Time: " + Math.abs((60 - this.game.time * 0.001).toFixed(1)),
      20,
      80
    );

    context.font = this.fontSize * 0.8 + "px " + this.fontFamily;

    //ENERGY
    context.fillText("Energy: ", 20, 110);
    context.strokeRect(100, 90, 100, 20);
    context.fillRect(100, 90, this.game.player.energy, 20);

    //lives
    context.fillText("Life: ", 20, 140);
    context.strokeRect(100, 120, 100, 20);
    context.fillRect(100, 120, this.game.lives, 20);

    //target Score
    context.fillText("Target: 60 ", 1400, 50);

    //game over messages
    if (this.game.gameOver) {
      if (this.game.score >= this.game.winningScore) {
        console.log("win");
        this.game.gameOverDiv.classList.remove("hide");
        this.game.gameStatusDiv.innerText = `YOU WIN!!!`;
        this.game.gameScore.innerHTML = `Score: ${this.game.score}`;
      } else {
        console.log("lose");
        this.game.gameStatusDiv.innerText = `YOU LOSE!!!`;
        this.game.gameScore.innerHTML = `Score: ${this.game.score}`;
        this.game.gameOverDiv.classList.remove("hide");
      }
    }
  }
}
