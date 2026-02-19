const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('current-score');
const bestScoreElement = document.getElementById('best-score');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const overlayMsg = document.getElementById('overlay-msg');
const restartBtn = document.getElementById('restart-btn');

// Game constants
const GRID_SIZE = 20;
const INITIAL_SPEED = 160; // ms per frame (higher = slower)
let TILE_COUNT;
let TILE_SIZE;

// Game state
let snake = [];
let food = { x: 0, y: 0 };
let dx = 0;
let dy = 0;
let score = 0;
let bestScore = localStorage.getItem('snakeBestScore') || 0;
let gameLoop;
let isGameOver = false;
let isPaused = true;

bestScoreElement.textContent = bestScore;

function initCanvas() {
    // Make it responsive but keep it square
    const size = Math.min(window.innerWidth * 0.8, 600);
    canvas.width = 600; // Logical size
    canvas.height = 600;
    TILE_COUNT = GRID_SIZE;
    TILE_SIZE = canvas.width / TILE_COUNT;
}

function initGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    food = getRandomFoodPosition();
    dx = 0;
    dy = -1;
    score = 0;
    scoreElement.textContent = score;
    isGameOver = false;
    isPaused = false;

    overlay.classList.add('hidden');

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(draw, INITIAL_SPEED);
}

function getRandomFoodPosition() {
    let newFood;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };
        // Check if food spawns on snake
        const onSnake = snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
        if (!onSnake) break;
    }
    return newFood;
}

function draw() {
    update();
    if (isGameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = 'rgba(0,0,0,0.02)';
    for (let i = 0; i < TILE_COUNT; i++) {
        ctx.beginPath(); ctx.moveTo(i * TILE_SIZE, 0); ctx.lineTo(i * TILE_SIZE, canvas.height); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i * TILE_SIZE); ctx.lineTo(canvas.width, i * TILE_SIZE); ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#B59489'; // var(--food-color)
    ctx.beginPath();
    const centerX = food.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = food.y * TILE_SIZE + TILE_SIZE / 2;
    ctx.arc(centerX, centerY, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#7D8471' : '#8B9DA3'; // head vs body

        // Rounded rectangles for segments
        const r = 4;
        const x = segment.x * TILE_SIZE + 1;
        const y = segment.y * TILE_SIZE + 1;
        const w = TILE_SIZE - 2;
        const h = TILE_SIZE - 2;

        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
        ctx.fill();
    });
}

function update() {
    if (isPaused || isGameOver) return;

    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        gameOver();
        return;
    }

    // Self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = score;
        food = getRandomFoodPosition();
        if (score > bestScore) {
            bestScore = score;
            bestScoreElement.textContent = bestScore;
            localStorage.setItem('snakeBestScore', bestScore);
        }
    } else {
        snake.pop();
    }
}

function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);
    overlayTitle.textContent = "GAME OVER";
    overlayMsg.textContent = `You scored ${score} points!`;
    restartBtn.textContent = "Try Again";
    overlay.classList.remove('hidden');
}

window.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy !== 1) { dx = 0; dy = -1; }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy !== -1) { dx = 0; dy = 1; }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx !== 1) { dx = -1; dy = 0; }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx !== -1) { dx = 1; dy = 0; }
            break;
    }
});

restartBtn.addEventListener('click', initGame);

initCanvas();
// Show initial overlay
overlayTitle.textContent = "SNAKE";
overlayMsg.textContent = "A Funny Experience";
restartBtn.textContent = "Start Game";
overlay.classList.remove('hidden');
