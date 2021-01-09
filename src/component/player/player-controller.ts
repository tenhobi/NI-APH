import * as ECS from "../../../libs/pixi-ecs";
import {Message} from "../../../libs/pixi-ecs";
import {Config} from "../../config";
import {Attrs, Messages} from "../../constants";
import {Coords, Factory} from "../../utils";
import AnimatedSprite from "../../../libs/pixi-ecs/engine/game-objects/animated-sprite";
import {BombPlacedMessage} from "../stage/game-manager";

type PlayerMoveMessage = {
    player: ECS.Container,
    futureBounds: PIXI.Rectangle,
}

type PlaceBombMessage = {
    player: ECS.Container,
    coords: Coords,
}

class PlayerController extends ECS.Component {
    private upTextures;
    private rightTextures;
    private downTextures;
    private leftTextures;

    private playing: boolean;
    private lastPlacedBomb: Coords;
    private animatedSprite: AnimatedSprite;
    private maxBombCount: number;
    private bombsLeftCount: number;

    private readonly playerNumber: number;

    constructor(player: number) {
        super();
        this.playerNumber = player;
    }

    onInit() {
        super.onInit();

        this.animatedSprite = this.owner.asAnimatedSprite();
        this.animatedSprite.animationSpeed = 0.2;
        this.animatedSprite.loop = false;

        let factory = new Factory();
        this.upTextures = factory.createPlayerTexturesUp(this.playerNumber);
        this.rightTextures = factory.createPlayerTexturesRight(this.playerNumber);
        this.downTextures = factory.createPlayerTexturesDown(this.playerNumber);
        this.leftTextures = factory.createPlayerTexturesLeft(this.playerNumber);

        this.maxBombCount = Config.BOMB_DEFAULT_COUNT;
        this.bombsLeftCount = this.maxBombCount;

        this.owner.assignAttribute(Attrs.BOMB_POWER, Config.BOMB_POWER)
        this.owner.assignAttribute(Attrs.SPEED, Config.PLAYER_SPEED);
        this.owner.assignAttribute(Attrs.PLAYER_Y, this.owner.position.y);
        this.owner.assignAttribute(Attrs.PLAYER_X, this.owner.position.x);
        this.owner.assignAttribute(Attrs.LAST_PLAYER_BOMB, null);
        this.owner.assignAttribute(Attrs.PLAYING, true);
        this.playing = true;

        this.subscribe(Messages.BOMB_EXPLOSION_FINISHED, Messages.BOMB_PLACED);
    }

    onMessage(msg: Message): any {
        if (msg.action == Messages.BOMB_EXPLOSION_FINISHED) {
            let payload = msg.data as BombExplosionFinishedMessage;
            let { player } = payload;

            if (this.owner == player) {
                this.bombsLeftCount++;

                console.log("__ INCREMENT");

                if (this.bombsLeftCount > this.maxBombCount) {
                    this.bombsLeftCount = this.maxBombCount;
                }
            }
        } else if (msg.action == Messages.BOMB_PLACED) {
            let payload = msg.data as BombPlacedMessage;
            let { player } = payload;

            if (this.owner == player) {
                this.bombsLeftCount--;

                console.log("__ DECREMENT");

                if (this.bombsLeftCount < 0) {
                    this.bombsLeftCount = 0;
                }
            }
        }
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        if (this.playing) {
            this.owner.position.y = this.owner.getAttribute<number>(Attrs.PLAYER_Y);
            this.owner.position.x = this.owner.getAttribute<number>(Attrs.PLAYER_X);
            this.lastPlacedBomb = this.owner.getAttribute<Coords>(Attrs.LAST_PLAYER_BOMB);
            this.playing = this.owner.getAttribute<boolean>(Attrs.PLAYING);

            if (this.playing == false) {
                this.animatedSprite.texture.destroy();
            }
        }
    }

    protected moveLeft(delta: number) {
        if (!this.playing) return;

        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.leftTextures;
            this.animatedSprite.play();
        }
        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.x -= delta * this.owner.getAttribute<number>(Attrs.SPEED);

        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerMoveMessage);
    }

    protected moveRight(delta: number) {
        if (!this.playing) return;

        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.rightTextures;
            this.animatedSprite.play();
        }

        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.x += delta * this.owner.getAttribute<number>(Attrs.SPEED);

        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerMoveMessage);
    }

    protected moveUp(delta: number) {
        if (!this.playing) return;

        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.upTextures;
            this.animatedSprite.play();
        }

        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.y -= delta * this.owner.getAttribute<number>(Attrs.SPEED);

        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerMoveMessage);
    }

    protected moveDown(delta: number) {
        if (!this.playing) return;

        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.downTextures;
            this.animatedSprite.play();
        }

        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.y += delta * this.owner.getAttribute<number>(Attrs.SPEED);

        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerMoveMessage);
    }

    protected placeBomb() {
        if (!this.playing) return;

        if (this.bombsLeftCount <= 0) {
            return;
        }

        let x = Math.floor(this.owner.x);
        let y = Math.floor(this.owner.y);

        this.sendMessage(Messages.BOMB_PLACE, {
            player: this.owner,
            coords: {x, y},
        } as PlaceBombMessage);
    }
}

export {
    PlayerController,
    PlayerMoveMessage,
    PlaceBombMessage,
}