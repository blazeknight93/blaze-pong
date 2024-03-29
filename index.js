// Constants
const canvas = document.getElementById("pong");
const context = canvas.getContext("2d");
const ballRadius = 15;
const paddleWidth = 15;
const paddleHeight = 100;
const paddleSpeed = 10;
const player1Keys = { up: "w", down: "s" };
const player2Keys = { up: "ArrowUp", down: "ArrowDown" };
const aiDifficulty = "easy"; // AI difficulty level (easy, medium, hard)

// Update canvas size
canvas.width = 800; // Double the current width
canvas.height = 459; // Double the current height

// Game Variables
let gameStarted = false;
let gamePaused = false;
let player1Score = 0;
let player2Score = 0;
let maxScore = 11;
let winningMargin = 2;
let gameMode = "single";
let default_Ballspeed = 1.25;
let speed_multiplier = 1.1;

// AI Variables
let aiSuccessRate = 0.55; // Default success rate for AI paddle

// Paddle Objects
const player1 = {
  x: 0,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "red",
  dy: 0,
};

const player2 = {
  x: canvas.width - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "#0096FF",
  dy: 0,
};

// Ball Object
const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  speed: default_Ballspeed,
  dx: 4,
  dy: 4,
  color: "#fff",
};



// Event Listeners
document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// Function to handle keydown events
function handleKeyDown(event) {
  // Handle player 1 controls
  if (gameMode === "multiplayer" || gameMode === "single") {
    if (event.key === player1Keys.up) {
      player1.dy = -paddleSpeed;
    } else if (event.key === player1Keys.down) {
      player1.dy = paddleSpeed;
    }
  }
  // Handle player 2 controls
  if (
    gameMode === "multiplayer" ||
    (gameMode === "single" &&
      event.key !== player1Keys.up &&
      event.key !== player1Keys.down)
  ) {
    if (event.key === player2Keys.up) {
      player2.dy = -paddleSpeed;
    } else if (event.key === player2Keys.down) {
      player2.dy = paddleSpeed;
    }
  }
  // Pause/unpause the game on "P" key press
  if (event.key === "p" || event.key === "P") {
    gamePaused = !gamePaused;
  }
}

// Function to handle keyup events
function handleKeyUp(event) {
  // Handle player 1 controls
  if (gameMode === "multiplayer" || gameMode === "single") {
    if (event.key === player1Keys.up || event.key === player1Keys.down) {
      player1.dy = 0;
    }
  }
  // Handle player 2 controls
  if (
    gameMode === "multiplayer" ||
    (gameMode === "single" &&
      event.key !== player1Keys.up &&
      event.key !== player1Keys.down)
  ) {
    if (event.key === player2Keys.up || event.key === player2Keys.down) {
      player2.dy = 0;
    }
  }
}

// Function to update paddles' position
function updatePaddle(paddle) {
  paddle.y += paddle.dy;

  // Restrict paddle movement within the canvas
  if (paddle.y < 0) {
    paddle.y = 0;
  } else if (paddle.y + paddle.height > canvas.height) {
    paddle.y = canvas.height - paddle.height;
  }
}

// Function to update AI paddle's position
function updateAIPaddle() {
  // Calculate the target position for the AI paddle
  let targetY = ball.y - player1.height / 2;

  // Adjust the target position based on AI difficulty
  if (aiDifficulty === "easy") {
    // easy difficulty adds lots of randomness to the target position
    targetY += Math.random() * 20 - 20;
  } else if (aiDifficulty === "medium") {
    // Medium difficulty adds some randomness to the target position
    targetY += Math.random() * 20 - 10;
  } else if (aiDifficulty === "hard") {
    // Hard difficulty tries to predict the ball's position
    if (ball.dx > 0) {
      // Predict the ball's position when moving towards the AI paddle
      const predictedY =
        ball.y +
        ((ball.x - player1.x) / ball.dx) * ball.dy -
        player1.height / 2;
      targetY = predictedY;
    } else {
      // Fall back to basic AI behavior if ball is moving away
      targetY = ball.y - player1.height / 2;
    }
  }

  // Adjust the target position based on AI success rate
  if (Math.random() > aiSuccessRate) {
    // Miss the ball by offsetting the target position
    const offsetY = Math.random() * (canvas.height - player1.height);
    targetY = offsetY;
  }

  // Move the AI paddle towards the target position
  if (player1.y < targetY) {
    player1.dy = paddleSpeed;
  } else if (player1.y > targetY) {
    player1.dy = -paddleSpeed;
  } else {
    player1.dy = 0;
  }
}

// Function to reset the ball's position and speed
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = default_Ballspeed;
  ball.dx *= -1;
  ball.dy *= Math.random() < 0.5 ? -1 : 1;
}

function updateBall() {
  ball.x += ball.dx * ball.speed;
  ball.y += ball.dy * ball.speed;

  // Check for collision with paddles
  if (
    ball.y + ball.radius > player1.y &&
    ball.y - ball.radius < player1.y + player1.height &&
    ball.dx < 0
  ) {
    if (ball.x - ball.radius < player1.x + player1.width) {
      ball.dx *= -1;
      ball.speed *= speed_multiplier; // Increase ball speed on return
    }
  }

  if (
    ball.y + ball.radius > player2.y &&
    ball.y - ball.radius < player2.y + player2.height &&
    ball.dx > 0
  ) {
    if (ball.x + ball.radius > player2.x) {
      ball.dx *= -1;
      ball.speed *= speed_multiplier; // Increase ball speed on return
    }
  }

  // Check for collision with top and bottom walls
  if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
}



// Function to handle collision and score updates
function handleCollision() {
  // Check for collision with left and right walls
  if (ball.x + ball.radius > canvas.width) {
    player1Score++;
    resetBall();
    resetAI();
  } else if (ball.x - ball.radius < 0) {
    player2Score++;
    resetBall();
    resetAI();
  }
}


// Function to reset the game
function resetGame() {
  player1Score = 0;
  player2Score = 0;
  resetBall();
  resetAI();
  gameStarted = false;
  gamePaused = false;
}

// Function to reset the AI paddle's position
function resetAI() {
  player1.y = canvas.height / 2 - paddleHeight / 2;
}

// Function to update the canvas
function update() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);

  if (!gameStarted) {
    context.fillStyle = "#fff";
    context.font = "30px Arial";
    context.fillText(
      "Press Space to Start",
      canvas.width / 2 - 130,
      canvas.height / 2
    );
  } else if (gamePaused) {
    context.fillStyle = "#fff";
    context.font = "30px Arial";
    context.fillText(
      "Paused",
      canvas.width / 2 - 50,
      canvas.height / 2
    );
  } else {
    updatePaddle(player1);
    updatePaddle(player2);
    updateBall();
    handleCollision();
    const gameOverMessage = checkGameOver();

    if (gameOverMessage) {
      context.fillStyle = "#fff";
      context.font = "30px Arial";
      context.fillText(
        gameOverMessage,
        canvas.width / 2 - 120,
        canvas.height / 2
      );

      context.font = "20px Arial";
      context.fillText(
        "Press Space to Play Again",
        canvas.width / 2 - 130,
        canvas.height / 2 + 50
      );
    } else {
      updateAIPaddle();
      context.fillStyle = player1.color;
      context.fillRect(player1.x, player1.y, player1.width, player1.height);

      context.fillStyle = player2.color;
      context.fillRect(player2.x, player2.y, player2.width, player2.height);

      context.fillStyle = ball.color;
      context.beginPath();
      context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      context.closePath();
      context.fill();

      context.fillStyle = "#fff";
      context.font = "30px Arial";
      context.fillText(player1Score, canvas.width / 2 - 50, 50);
      context.fillText(player2Score, canvas.width / 2 + 25, 50);
    }
  }

  requestAnimationFrame(update);
}


// Function to check for game over
function checkGameOver() {
  if (
    (player1Score >= maxScore &&
      player1Score - player2Score >= winningMargin) ||
    (player2Score >= maxScore &&
      player2Score - player1Score >= winningMargin)
  ) {
    if (player1Score > player2Score) {
      return "Player 1 wins!";
    } else {
      return "Player 2 wins!";
    }
  } else {
    return null;
  }
}


// Function to start the game
function startGame() {
  if (!gameStarted) {
    gameStarted = true;
    requestAnimationFrame(update);
  }
}

// Function to handle the Space bar press
function handleSpaceBar() {
  if (!gameStarted || player1Score >= maxScore || player2Score >= maxScore) {
    resetGame();
    resetBall();
    startGame();
  }
}

// Event listener to start the game on Space bar press
document.addEventListener("keydown", function (event) {
  if (event.key === " ") {
    handleSpaceBar();
  }
});

// Initialize the game
resetGame();

