import * as ECS from "../../../libs/pixi-ecs";
import {Config} from "../../config";
import {Attrs, Tags, Messages} from "../../constants";
import {CollisionUtils, Factory} from "../../utils";
import {BombController} from "../bomb/bomb-controller";
import AnimatedSprite from "../../../libs/pixi-ecs/engine/game-objects/animated-sprite";
import {Coords} from "../../utils";

type PlayerWantsToMoveMessage = {
    player: ECS.Container,
    futureBounds: PIXI.Rectangle,
}

class PlayerController extends ECS.Component {
    private upTextures = Factory.createPlayerTexturesUp();
    private rightTextures = Factory.createPlayerTexturesRight();
    private downTextures = Factory.createPlayerTexturesDown();
    private leftTextures = Factory.createPlayerTexturesLeft();

    private lastPlacedBomb: Coords;
    private animatedSprite: AnimatedSprite;

    onInit() {
        super.onInit();
        this.animatedSprite = this.owner.asAnimatedSprite();
        this.animatedSprite.animationSpeed = 0.2;
        this.animatedSprite.loop = false;
        this.owner.assignAttribute(Attrs.SPEED, Config.PLAYER_SPEED);
        this.owner.assignAttribute(Attrs.PLAYER_Y, this.owner.position.y);
        this.owner.assignAttribute(Attrs.PLAYER_X, this.owner.position.x);
        this.owner.assignAttribute(Attrs.PLAYER_BOMB, null);
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        this.owner.position.y = this.owner.getAttribute<number>(Attrs.PLAYER_Y);
        this.owner.position.x = this.owner.getAttribute<number>(Attrs.PLAYER_X);
        this.lastPlacedBomb = this.owner.getAttribute<Coords>(Attrs.PLAYER_BOMB);
    }

    protected moveLeft(units: number) {
        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.leftTextures;
            this.animatedSprite.play();
        }
        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.x -= units;

        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerWantsToMoveMessage);
    }

    protected moveRight(units: number) {
        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.rightTextures;
            this.animatedSprite.play();
        }

        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.x += units;

        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerWantsToMoveMessage);
    }

    protected moveUp(units: number) {
        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.upTextures;
            this.animatedSprite.play();
        }

        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.y -= units;
        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerWantsToMoveMessage);
    }

    protected moveDown(units: number) {
        if (!this.animatedSprite.playing) {
            this.animatedSprite.textures = this.downTextures;
            this.animatedSprite.play();
        }

        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.y += units;
        this.sendMessage(Messages.PLAYER_WANTS_TO_MOVE, {
            player: this.owner,
            futureBounds: futurePositionBounds,
        } as PlayerWantsToMoveMessage);
    }

    protected placeBomb() {
        let x = Math.floor(this.owner.x);
        let y = Math.floor(this.owner.y);


        if (this.canAddBombToLocation(x, y)) {
            this.addBomb(x, y);
        }
    }

    protected canAddBombToLocation(x: number, y: number): boolean {
        const emptyCells = this.scene.findObjectsByTag(Tags.EMPTY);
        const bombs = this.scene.findObjectsByTag(Tags.BOMB);

        let isEmptyCell = false;
        // Is empty cell?
        for (let cell of emptyCells) {
            if (cell.x == x && cell.y == y) {
                isEmptyCell = true;
                break;
            }
        }
        if (!isEmptyCell) {
            return false;
        }

        // Is there another bomb?
        for (let bomb of bombs) {
            if (bomb.x == x && bomb.y == y) {
                return false;
            }
        }

        return true;
    }

    protected addBomb(x: number, y: number) {
        this.owner.assignAttribute(Attrs.PLAYER_BOMB, {x, y});
        this.lastPlacedBomb = {x, y};

        const bomb = new ECS.Builder(this.owner.scene)
            .localPos(x, y)
            .withTag(Tags.BOMB)
            .asSprite(Factory.createTexture(8 * Config.TEXTURE_WIDTH, 18 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(this.owner.scene.stage)
            .withComponent(new BombController())
            .scale(Config.TEXTURE_SCALE)
            .build();
    }
}

export {
    PlayerController,
    PlayerWantsToMoveMessage,
}