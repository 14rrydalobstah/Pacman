import MovingDirection from "./MovingDirections.js";

export default class Pacman {
    constructor(x, y, tileSize, velocity, tileMap) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.velocity = velocity;
        this.tileMap = tileMap;


        this.currentMovingDirection = null;
        this.requestedMovingDirection = null;

        this.pacmanAnimationTimerDefault = 10;
        this.pacmanAnimationTimer = null;

        this.pacmanRotation = this.Rotation.right;

        this.wakaSound = new Audio('sounds/waka.wav');
        this.powerDotSound = new Audio('sounds/power_dot.wav');
        this.eatGhostSound = new Audio('sounds/eat_ghost.wav');
        this.powerDotActive = false;
        this.powerDotAboutToExpire = false;
        this.timers = [];

        this.madeFirstMove = false;

        document.addEventListener('keydown', this.#keydown);

        this.#loadPacmanImages();

    }

    Rotation = {
        right: 0,
        down: 1,
        left: 2,
        up: 3,
    }

    draw(ctx, pause, enemies) {
        if (!pause) {
            this.#move();
            this.#animate();
        }
        this.#eatDot();
        this.#eatPowerDot();
        this.#eatGhost(enemies);

        const size = this.tileSize / 2;

        //旋转Pacman
        ctx.save();
        ctx.translate(this.x + size, this.y + size);
        ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180);
        ctx.drawImage(this.pacmanImages[this.pacmanImageIndex], -size, -size, this.tileSize, this.tileSize);
        ctx.restore();
        // ctx.drawImage(this.pacmanImages[this.pacmanImageIndex],
        //     this.x,
        //     this.y,
        //     this.tileSize,
        //     this.tileSize);
    }

    #loadPacmanImages() {
        const pacmanImage1 = new Image();
        pacmanImage1.src = "images/pac0.png";

        const pacmanImage2 = new Image();
        pacmanImage2.src = "images/pac1.png";

        const pacmanImage3 = new Image();
        pacmanImage3.src = "images/pac2.png";

        const pacmanImage4 = new Image();
        pacmanImage4.src = "images/pac1.png";

        this.pacmanImages = [
            pacmanImage1,
            pacmanImage2,
            pacmanImage3,
            pacmanImage4,
        ];

        this.pacmanImageIndex = 0;
    }

    #keydown = (event) => {
        if (event.keyCode === 38) {
            //上键
            if (this.currentMovingDirection == MovingDirection.down) {
                this.currentMovingDirection = MovingDirection.up;
                //若吃豆人已经在向下移动，则可以接受向上命令
            }
            //若不是已经在向下运动则要检查是否可以向上运动 记录下当前请求
            this.requestedMovingDirection = MovingDirection.up;
            this.madeFirstMove = true;
            //接收到按键指令，就将该变量变为true代表pacman已经开始移动
        }
        if (event.keyCode === 40) {
            //下键
            if (this.currentMovingDirection == MovingDirection.up) {
                this.currentMovingDirection = MovingDirection.down
            }
            this.requestedMovingDirection = MovingDirection.down;
            this.madeFirstMove = true;
        }
        if (event.keyCode === 37) {
            //左键
            if (this.currentMovingDirection == MovingDirection.right) {
                this.currentMovingDirection = MovingDirection.left;
            }
            this.requestedMovingDirection = MovingDirection.left;
            this.madeFirstMove = true;
        }
        if (event.keyCode === 39) {
            //右键
            if (this.currentMovingDirection == MovingDirection.left) {
                this.currentMovingDirection = MovingDirection.right;
            }
            this.requestedMovingDirection = MovingDirection.right;
            this.madeFirstMove = true;
        }
    }

    #move() {
        // 检查当前的移动方向是否等于请求的移动方向
        if (this.currentMovingDirection !== this.requestedMovingDirection) {
            //若不等于请求的移动方向，且此时吃豆人坐标刚好在各种中心，则改变方向
            if (Number.isInteger(this.x / this.tileSize) &&
                Number.isInteger(this.y / this.tileSize)) {
                // 检查要去的方向是否会与地图碰撞
                if (!this.tileMap.didCollideWithEnvironment(
                    this.x,
                    this.y,
                    this.requestedMovingDirection
                )
                )
                    this.currentMovingDirection = this.requestedMovingDirection;

            }
        }

        // 检查当前方向下一格是否有障碍，若有，则让pacman停止移动
        if (this.tileMap.didCollideWithEnvironment(this.x, this.y, this.currentMovingDirection)) {
            this.currentMovingDirection = null;
            this.pacmanAnimationTimer = null;
            this.pacmanImageIndex = 1;
            //return; // 停止移动
        }
        //检查目前是否有移动方向且计时器是否为空(判断是否是初始状态)
        else if (this.currentMovingDirection != null && this.pacmanAnimationTimer == null) {
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
        }

        switch (this.currentMovingDirection) {
            case MovingDirection.up:
                this.y -= this.velocity;
                this.pacmanRotation = this.Rotation.up;
                break;
            case MovingDirection.down:
                this.y += this.velocity;
                this.pacmanRotation = this.Rotation.down;
                break;
            case MovingDirection.left:
                this.x -= this.velocity;
                this.pacmanRotation = this.Rotation.left;
                break;
            case MovingDirection.right:
                this.x += this.velocity;
                this.pacmanRotation = this.Rotation.right;
                break;
        }
    }

    #animate() {
        if (this.pacmanAnimationTimer == null) {
            return;
        }
        this.pacmanAnimationTimer--;
        // 检查计数器是否为0 若是则重置计数器并改变pacman的动作
        if (this.pacmanAnimationTimer == 0) {
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault;
            this.pacmanImageIndex++;
            // 利用数组是pacman动作循环 闭嘴 -> 半开 -> 全开 -> 半开 
            if (this.pacmanImageIndex == this.pacmanImages.length) {
                this.pacmanImageIndex = 0;
            }
        }
    }

    #eatDot() {
        // 如果pacman吃到一个点就播放音效
        if (this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) {
            this.wakaSound.play();
        }
    }

    #eatPowerDot() {
        if (this.tileMap.eatPowerDot(this.x, this.y)) {
            // ghost 变成蓝色
            this.powerDotSound.play();
            // 刚吃到能量豆时，将active状态变为true，即将过期状态变为false
            this.powerDotActive = true;
            this.powerDotAboutToExpire = false;
            // 当之前吃了能量豆又吃到新的能量豆时，清除之前能量豆的计时器并设定一个新的
            this.timers.forEach((timer) => clearTimeout(timer));
            this.timers = [];

            let powerDotTimer = setTimeout(() => {
                this.powerDotActive = false;
                this.powerDotAboutToExpire = false;
            }, 1000 * 6);

            this.timers.push(powerDotTimer);

            let powerDotAboutToExpireTimer = setTimeout(() => {
                this.powerDotAboutToExpire = true;

            }, 1000 * 3);

            this.timers.push(powerDotAboutToExpireTimer);
        }
    }

    #eatGhost(enemies) {
        if (this.powerDotActive) {
            //判断是否吃能量豆                                      //判断是否吃能量豆后于ghost碰撞
            const collideEnemies = enemies.filter((enemy) => enemy.collideWith(this));
            // 若为真则移除一只ghost，并播放吃ghost音效
            collideEnemies.forEach((enemy) => {
                enemies.splice(enemies.indexOf(enemy), 1);
                this.eatGhostSound.play();
            })
        }
    }
}