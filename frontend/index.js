const BACKGROUND_COLOR = "#659DBD";
const PLAYER_ONE_COLOUR = "#8D8741";
const PLAYER_TWO_COLOUR = "#FC4445";
const FOOD_COLOUR = "#FBEEC1";
                    
                    // Backend URL
const socket = io("http://localhost:3000", {
  extraHeaders: {
    "Access-Control-Allow-Origin": "http://localhost:8080", // This allows to have Cors access from the backend
  },
});

socket.on("init", handleInit);
socket.on("gameState", handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownCode", handleUnknownCode);
socket.on("tooManyPlayers", handleTooManyPlayers);

const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");

newGameBtn.addEventListener("click" , newGame);
joinGameBtn.addEventListener("click" , joinGame);

function newGame(){
    socket.emit("newGame"); 
    // Backend will create a new UUId and generatae a game,this uuid will be used for joining 
    // the game 
    startGame();
}
 
function joinGame(){
    const code = gameCodeInput.ariaValueMax;
    socket.emit("joinGame" , code);
    startGame();
}

let canvas , canvasContext;
let playerNumber;
let gameActive = false;

function startGame(){
     initialScreen.style.display = "none";
     gameScreen.style.display = "block";

     canvas = document.getElementById("canvas") // white board where you can draw some graphics
     canvasContext = canvas.getContext("2d");

     canvas.width = canvas.height = 600;
 
     canvasContext.fillStyle = BACKGROUND_COLOR;
     canvasContext.fillRect(0, 0, canvas.width, canvas.height);
   
     document.addEventListener("keydown", keydown); // we want to control our snakes with the keys of our keyboard

    gameActive = true;
}

function keydown(e){
    socket.emit("keydown" , e.keyCode)
}

function paintGame(state){
    canvasContext.fillStyle = BACKGROUND_COLOR;
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);

    const food = state.food;
    const gridSize = state.gridSize;
    const size = canvas.width / gridSize;

  canvasContext.fillStyle = FOOD_COLOUR;
  canvasContext.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, PLAYER_ONE_COLOUR);
  paintPlayer(state.players[1], size, PLAYER_TWO_COLOUR);
}

function paintPlayer(playerState, size, colour) {
    const snake = playerState.snake;
  
    canvasContext.fillStyle = colour;
    for (let cell of snake) {
      canvasContext.fillRect(cell.x * size, cell.y * size, size, size);
    }
  }

  function handleInit(number) {
    playerNumber = number;
  }
  
  function handleGameState(gameState) {
    if (!gameActive) {
      return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
  }
  
  function handleGameOver(data) {
    if (!gameActive) {
      return;
    }
    data = JSON.parse(data);
  
    gameActive = false;
  
    if (data.winner === playerNumber) {
      alert("Winner Winner, Chicken Dinner!");
    } else {
      alert("You met your demise");
    }
  }
  
  function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
  }
  
  function handleUnknownCode() {
    reset();
    alert("Unknown Game Code");
  }
  
  function handleTooManyPlayers() {
    reset();
    alert("This game is already in progress");
  }
  
  function reset() {
    playerNumber = null;
    gameCodeInput.value = "";
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
  }