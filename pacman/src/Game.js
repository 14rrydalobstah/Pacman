import TileMap from "./TileMap.js";

const tileSize = 32;
const velocity = 2;
const canvas = document.querySelector('#gameCanvas');
const ctx = canvas.getContext('2d');
const tileMap = new TileMap(tileSize);
const pacman = tileMap.getPacman(velocity);
const enemies = tileMap.getEnemies(velocity);

let gameOver = false;
let gameWin = false;
const gameOverSound = new Audio('sounds/gameOver.wav');
const gameWinSound = new Audio('sounds/gameWin.wav');

function gameLoop() {
    tileMap.draw(ctx);
    drawgGameEnd();
    pacman.draw(ctx, pause(), enemies);
    enemies.forEach((enemy) => enemy.draw(ctx, pause(), pacman));
    checkGameOver();
    checkGameWin();
}


function checkGameWin() {
    if (!gameWin) {
        gameWin = tileMap.didWin();
        if (gameWin) {
            gameWinSound.play();
        }
    }
}

function checkGameOver() {
    // 查看当前结束状态，若游戏还未结束：
    if (!gameOver) {
        gameOver = isGameOver();//调用isGameOver函数判断游戏结束条件
        if (gameOver) { //若结束则播放结束音乐
            gameOverSound.play();
        }
    }
}


function isGameOver() {
    return enemies.some((enemy) => !pacman.powerDotActive && enemy.collideWith(pacman));
}

// pause函数用来实现pacman动ghost才开始动的逻辑
function pause() {
    return !pacman.madeFirstMove || gameOver || gameWin;
    //返回pacman的状态 为true代表pacman已经动了，ghost也需要开始动
    //或者游戏结束
}

function drawgGameEnd() {
    if (gameOver || gameWin) {
        let text = ' You Win! '
        if (gameOver) {
            text = 'GameOver'
        }
        ctx.fillStyle = "black";
        ctx.fillRect(0, canvas.height / 3.2, canvas.width, 80);

        ctx.font = '80px comic sans';
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop('0', 'magenta');
        gradient.addColorStop('0.5', 'blue');
        gradient.addColorStop('1.0', 'green');
        // google canvas text ingredients

        ctx.fillStyle = gradient;
        ctx.fillText(text, 10, canvas.height / 2 + 10);

    }
}


tileMap.setCanvasSize(canvas);
setInterval(gameLoop, 1000 / 75);//一秒刷新75次屏幕
