
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 0; //bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;
let tokens = 0;
let highScore = loadHighScore();
let aiMode = false;
let aiToggle;

//audio
let jumpSound;
let hitSound;
let scoreSound;
let backgroundMusic;
let masterVolume = 0.5;

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board
    aiToggle = document.getElementById("ai-toggle");
    aiToggle.addEventListener("click", toggleAI);
    board.addEventListener("pointerdown", handlePointerControl);
    initializeAudio();

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./flappybird.png";
    birdImg.onload = function() {
        drawSpaceship();
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);
    document.addEventListener("pointerdown", startBackgroundMusic, { once: true });
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    updateAI();
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    drawSpaceship();

    if (bird.y > board.height) {
        endGame();
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        drawLaserObstacle(pipe);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            tokens += 0.5;
            pipe.passed = true;

            if (score > highScore) {
                highScore = score;
                saveHighScore();
            }

            if (Number.isInteger(score)) {
                playSound(scoreSound);
            }
        }

        if (detectCollision(bird, pipe)) {
            endGame();
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //tokens and score
    context.fillStyle = "white";
    context.font="bold 20px 'Courier New'";
    context.fillText("TOKENS: " + tokens, 8, 28);
    context.font="32px sans-serif";
    context.fillText("SCORE: " + score, 8, 66);
    context.font="bold 18px 'Courier New'";
    context.fillText("HIGH SCORE: " + highScore, 8, 94);

    if (gameOver) {
        context.font="32px sans-serif";
        context.fillText("GAME OVER", 8, 136);
    }
}

function drawLaserObstacle(pipe) {
    context.save();

    context.fillStyle = "rgba(255, 0, 170, 0.16)";
    context.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);

    context.shadowColor = "#ff00aa";
    context.shadowBlur = 16;
    context.strokeStyle = "#ff00aa";
    context.lineWidth = 4;
    context.strokeRect(
        pipe.x + 2,
        pipe.y + 2,
        pipe.width - 4,
        pipe.height - 4
    );

    context.shadowBlur = 10;
    context.fillStyle = "#ff4fd8";
    context.fillRect(pipe.x + pipe.width/2 - 3, pipe.y, 6, pipe.height);

    context.shadowBlur = 4;
    context.fillStyle = "#fff0fc";
    context.fillRect(pipe.x + pipe.width/2 - 1, pipe.y, 2, pipe.height);

    context.restore();
}

function drawSpaceship() {
    let x = bird.x;
    let y = bird.y;
    let width = bird.width;
    let height = bird.height;

    context.save();
    context.shadowColor = "#00eeff";
    context.shadowBlur = 10;

    context.beginPath();
    context.moveTo(x + width, y + height/2);
    context.lineTo(x, y);
    context.lineTo(x + width/4, y + height/2);
    context.lineTo(x, y + height);
    context.closePath();
    context.fillStyle = "#10162f";
    context.fill();
    context.strokeStyle = "#00eeff";
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();
    context.moveTo(x + width/4, y + height/2);
    context.lineTo(x, y + height/3);
    context.lineTo(x, y + height*2/3);
    context.closePath();
    context.fillStyle = "#ff00cc";
    context.fill();

    context.restore();
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    // 0 -> -128 (pipeHeight/4)
    // 1 -> -128 - 256 (pipeHeight/4 - pipeHeight/2) = -3/4 pipeHeight
    let randomPipeY = pipeY - pipeHeight/4 - Math.random()*(pipeHeight/2);
    let openingSpace = board.height/4;

    let topPipe = {
        img : topPipeImg,
        x : pipeX,
        y : randomPipeY,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img : bottomPipeImg,
        x : pipeX,
        y : randomPipeY + pipeHeight + openingSpace,
        width : pipeWidth,
        height : pipeHeight,
        passed : false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    startBackgroundMusic();

    if (e.code == "KeyA") {
        toggleAI();
        return;
    }

    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        //jump
        flap();

        //reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            tokens = 0;
            gameOver = false;
        }
    }
}

function handlePointerControl(e) {
    e.preventDefault();
    startBackgroundMusic();
    flap();

    if (gameOver) {
        bird.y = birdY;
        pipeArray = [];
        score = 0;
        tokens = 0;
        gameOver = false;
    }
}

function toggleAI() {
    aiMode = !aiMode;
    aiToggle.textContent = aiMode ? "AI MODE: ON" : "AI MODE: OFF";
    aiToggle.classList.toggle("active", aiMode);
}

function updateAI() {
    if (!aiMode || gameOver) {
        return;
    }

    let targetY = board.height/2;

    for (let i = 0; i < pipeArray.length; i += 2) {
        let topPipe = pipeArray[i];
        let bottomPipe = pipeArray[i + 1];

        if (bottomPipe && topPipe.x + topPipe.width >= bird.x) {
            let gapTop = topPipe.y + topPipe.height;
            let gapBottom = bottomPipe.y;
            targetY = (gapTop + gapBottom)/2;
            break;
        }
    }

    let birdCenterY = bird.y + bird.height/2;

    if (birdCenterY > targetY + 10 && velocityY > -2) {
        flap();
    }
}

function flap() {
    velocityY = -6;
    playSound(jumpSound);
}

function endGame() {
    if (!gameOver) {
        gameOver = true;
        playSound(hitSound);
    }
}

function initializeAudio() {
    jumpSound = new Audio("./sfx_wing.wav");
    hitSound = new Audio("./sfx_hit.wav");
    scoreSound = new Audio("./sfx_point.wav");
    backgroundMusic = new Audio("./bgm_mario.mp3");
    backgroundMusic.loop = true;

    let volumeControl = document.getElementById("volume-control");
    let volumeValue = document.getElementById("volume-value");

    volumeControl.addEventListener("input", function() {
        masterVolume = Number(volumeControl.value)/100;
        volumeValue.textContent = volumeControl.value + "%";
        updateAudioVolumes();
    });

    updateAudioVolumes();
}

function updateAudioVolumes() {
    jumpSound.volume = masterVolume * 0.7;
    hitSound.volume = masterVolume;
    scoreSound.volume = masterVolume * 0.8;
    backgroundMusic.volume = masterVolume * 0.35;
}

function playSound(sound) {
    if (!sound || masterVolume === 0) {
        return;
    }

    sound.currentTime = 0;
    sound.play().catch(function() {});
}

function startBackgroundMusic() {
    if (backgroundMusic && backgroundMusic.paused && masterVolume > 0) {
        backgroundMusic.play().catch(function() {});
    }
}

function loadHighScore() {
    try {
        let savedScore = Number(localStorage.getItem("flappyBirdHighScore"));
        return Number.isFinite(savedScore) ? savedScore : 0;
    } catch (error) {
        return 0;
    }
}

function saveHighScore() {
    try {
        localStorage.setItem("flappyBirdHighScore", highScore);
    } catch (error) {
        // The game still works when browser storage is unavailable.
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}
