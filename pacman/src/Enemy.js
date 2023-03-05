import MovingDirection from "./MovingDirections.js";

export default class Enemy {
    constructor(x, y, tileSize, velocity, tileMap) {
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.velocity = velocity;
        this.tileMap = tileMap;

        this.#loadImages();

        this.movingDirection = Math.floor(
            Math.random() * Object.keys(MovingDirection).length
        );

        this.directionTimerDefault = this.#random(1, 10);
        this.directionTimer = this.directionTimerDefault;

        this.scaredAboutToExpireTimerDefault = 10;
        this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
    }

    draw(ctx, pause, pacman) {
        //pause接受pacman的状态,若为真代表pacman已经接收到移动指令，ghost就开始移动
        if (!pause) {
            this.#move();
            this.#changeDirection();
        }
        this.#setImage(ctx, pacman);

    }

    collideWith(pacman) {
        // 检查ghost和pacman的矩形模型是否重叠 (MDN：2d collision detection)
        const size = this.tileSize / 2;
        // 除以2查看pacman矩形是否有一半与ghost重叠
        if (
            this.x < pacman.x + size &&
            this.x + size > pacman.x &&
            this.y < pacman.y + size &&
            this.y + size > pacman.y
        ) {
            return true;
        }
        else {
            return false;
        }
    }

    // 根据pacman是否吃能量豆来改变ghost图片
    #setImage(ctx, pacman) {
        if (pacman.powerDotActive) {
            this.#setImageWhenPowerDotIsActive(pacman);
        } else {
            this.image = this.normalGhost;
        }
        ctx.drawImage(this.image, this.x, this.y, this.tileSize, this.tileSize)
    }

    #setImageWhenPowerDotIsActive(pacman) {
        if (pacman.powerDotAboutToExpire) {
            this.scaredAboutToExpireTimer--;
            if (this.scaredAboutToExpireTimer === 0) {
                this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault;
                if (this.image === this.scaredGhost) {
                    this.image = this.scaredGhost2;
                } else {
                    this.image = this.scaredGhost;
                }
            }
        } else {
            this.image = this.scaredGhost;
        }
    }

    //改变方向函数
    #changeDirection() {
        this.directionTimer--;
        let newMoveDirection = null;
        if (this.directionTimer === 0) {
            this.directionTimer = this.directionTimerDefault;
            // 当定时器为0时，随机改变方向 赋值给newMoveDirection 后续对其做判断
            newMoveDirection = Math.floor(Math.random() * Object.keys(MovingDirection).length);
        }
        // 确保碰撞后又新的前进方向且新的前进方向与之前的前进方向不同
        if (newMoveDirection != null && newMoveDirection != this.movingDirection) {
            if (Number.isInteger(this.x / this.tileSize) && Number.isInteger(this.y / this.tileSize)) {
                // 确保新的前进方向没有撞墙
                if (!this.tileMap.didCollideWithEnvironment(this.x, this.y, newMoveDirection)) {
                    // 所有情况都确认完毕后改变方向
                    this.movingDirection = newMoveDirection;
                }
            }
        }
    }


    #move() {
        if (
            !this.tileMap.didCollideWithEnvironment(
                this.x,
                this.y,
                this.movingDirection
            )
        ) {
            switch (this.movingDirection) {
                case MovingDirection.up:
                    this.y -= this.velocity;
                    break;
                case MovingDirection.down:
                    this.y += this.velocity;
                    break;
                case MovingDirection.left:
                    this.x -= this.velocity;
                    break;
                case MovingDirection.right:
                    this.x += this.velocity;
                    break;
            }
        }
    }

    #random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    #loadImages() {
        this.normalGhost = new Image();
        this.normalGhost.src = './images/ghost.png';

        this.scaredGhost = new Image();
        this.scaredGhost.src = './images/scaredGhost.png';

        this.scaredGhost2 = new Image();
        this.scaredGhost2.src = './images/scaredGhost2.png';

        this.image = this.normalGhost;
    }
}