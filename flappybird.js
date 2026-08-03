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
let basePipeWidth = 64;
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;
let pipeScale = 1.0;


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
    initializePipeControl();

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
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeArray[0].width) {
        pipeArray.shift(); //removes first element from the array
    }

    //tokens and score
    drawHud();

    if (gameOver) {
        context.font="32px sans-serif";
        context.fillText("GAME OVER", 8, 136);
    }
}

function drawLaserObstacle(pipe) {
    context.save();

    let isTopPipe = pipe.y < 0;
    let currentScale = pipe.width / 64; // Calculate current scale dynamically based on width
    let lipHeight = Math.max(12, Math.round(24 * currentScale));
    let lipY = isTopPipe ? pipe.y + pipe.height - lipHeight : pipe.y;
    let bodyGradient = context.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
    bodyGradient.addColorStop(0, "#7b075f");
    bodyGradient.addColorStop(0.18, "#ff23c8");
    bodyGradient.addColorStop(0.5, "#ff8bea");
    bodyGradient.addColorStop(0.76, "#e600aa");
    bodyGradient.addColorStop(1, "#4a063f");

    context.shadowColor = "#ff2bd6";
    context.shadowBlur = Math.max(5, Math.round(18 * currentScale));
    context.fillStyle = bodyGradient;
    
    let innerOffset = Math.max(2, Math.round(7 * currentScale));
    context.fillRect(pipe.x + innerOffset, pipe.y, pipe.width - 2 * innerOffset, pipe.height);

    context.strokeStyle = "#ff63e2";
    let lineWidthVal = Math.max(1, Math.round(3 * currentScale));
    context.lineWidth = lineWidthVal;
    let strokeOffset = innerOffset + lineWidthVal / 2;
    context.strokeRect(pipe.x + strokeOffset, pipe.y + lineWidthVal / 2, pipe.width - 2 * strokeOffset, pipe.height - lineWidthVal);

    context.shadowBlur = Math.max(5, Math.round(22 * currentScale));
    context.fillStyle = bodyGradient;
    context.fillRect(pipe.x, lipY, pipe.width, lipHeight);
    context.strokeStyle = "#ff8bea";
    context.strokeRect(pipe.x + lineWidthVal / 2, lipY + lineWidthVal / 2, pipe.width - lineWidthVal, lipHeight - lineWidthVal);

    context.shadowBlur = Math.max(2, Math.round(7 * currentScale));
    context.fillStyle = "rgba(255, 240, 252, 0.8)";
    let lightOffset = Math.max(4, Math.round(13 * currentScale));
    let lightWidth = Math.max(1, Math.round(3 * currentScale));
    context.fillRect(pipe.x + lightOffset, pipe.y + 3, lightWidth, pipe.height - 6);
    
    context.fillStyle = "rgba(48, 0, 46, 0.5)";
    let darkOffset = Math.max(5, Math.round(15 * currentScale));
    let darkWidth = Math.max(1, Math.round(5 * currentScale));
    context.fillRect(pipe.x + pipe.width - darkOffset, pipe.y + 3, darkWidth, pipe.height - 6);

    context.restore();
}

function drawHud() {
    context.save();
    context.fillStyle = "rgba(4, 2, 20, 0.72)";
    context.strokeStyle = "rgba(32, 246, 255, 0.8)";
    context.shadowColor = "#20f6ff";
    context.shadowBlur = 8;
    context.lineWidth = 1;
    context.fillRect(7, 7, 192, 94);
    context.strokeRect(7.5, 7.5, 191, 93);

    context.shadowColor = "#ff2bd6";
    context.fillStyle = "#ff8bea";
    context.font = "bold 17px 'Courier New'";
    context.fillText("TOKENS // " + tokens, 16, 31);
    context.fillStyle = "#ffffff";
    context.font = "bold 29px 'Courier New'";
    context.fillText("SCORE " + score, 16, 66);
    context.shadowColor = "#20f6ff";
    context.fillStyle = "#9ffbff";
    context.font = "bold 15px 'Courier New'";
    context.fillText("HIGH // " + highScore, 16, 90);
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
    context.arc(x + width * 0.62, y + height/2, 3, 0, Math.PI * 2);
    context.fillStyle = "#fff5ff";
    context.shadowColor = "#ff2bd6";
    context.shadowBlur = 12;
    context.fill();

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

function initializePipeControl() {
    let pipeWidthControl = document.getElementById("pipe-width-control");
    let pipeWidthValue = document.getElementById("pipe-width-value");

    pipeWidthControl.addEventListener("input", function() {
        let val = Number(pipeWidthControl.value);
        pipeScale = val / 100;
        pipeWidth = basePipeWidth * pipeScale;
        pipeWidthValue.textContent = val + "%";

        // Dynamically update the width of existing pipes on the board
        for (let i = 0; i < pipeArray.length; i++) {
            pipeArray[i].width = pipeWidth;
        }
    });
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
