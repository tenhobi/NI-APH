import * as ECS from "../../libs/pixi-ecs";
import {Config} from "../config";
import {Messages} from "../messages";
import {Tags} from "../tags";
import {CollisionUtils, TextureUtils} from "../utils";
import {BombController} from "./bomb-controller";

type Coords = {
    x: number,
    y: number,
}

class PlayerController extends ECS.Component {
    private playerSpeed: number = Config.PLAYER_SPEED;
    private lastPlacedBomb: Coords = null;

    onUpdate(delta: number, absolute: number) {
        const keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);

        if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_LEFT)) {
            this.moveLeft(delta * this.playerSpeed);
        }
        if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_RIGHT)) {
            this.moveRight(delta * this.playerSpeed);
        }
        if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_UP)) {
            this.moveUp(delta * this.playerSpeed);
        }
        if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_DOWN)) {
            this.moveDown(delta * this.playerSpeed);
        }
        if (keyInputCmp.isKeyPressed(ECS.Keys.KEY_SPACE)) {
            keyInputCmp.handleKey(ECS.Keys.KEY_SPACE);
            // this.sendMessage(Messages.BOMB_PLACED, {x: Math.floor(this.owner.x), y: Math.floor(this.owner.y)});

            let x = Math.floor(this.owner.x);
            let y = Math.floor(this.owner.y);
            if (this.canAddBombToLocation(x, y)) {
                this.addBomb(x, y);
            }

        }
    }

    private moveLeft(units: number) {
        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.x -= units;
        if (!this.hasCollision(futurePositionBounds)) {
            this.owner.position.x -= units;
        }
    }

    private moveRight(units: number) {
        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.x += units;
        if (!this.hasCollision(futurePositionBounds)) {
            this.owner.position.x += units;
            const cBound = this.owner.getBounds();
        }
    }

    private moveUp(units: number) {
        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.y -= units;
        if (!this.hasCollision(futurePositionBounds)) {
            this.owner.position.y -= units;
        }
    }

    private moveDown(units: number) {
        const futurePositionBounds = this.owner.getBounds().clone();
        futurePositionBounds.y += units;
        if (!this.hasCollision(futurePositionBounds)) {
            this.owner.position.y += units;
        }
    }

    private hasCollision(futurePosition: PIXI.Rectangle) {
        const solidWalls = this.scene.findObjectsByTag(Tags.SOLID_WALL);
        const breakableWalls = this.scene.findObjectsByTag(Tags.BREAKABLE_WALL);
        const bombs = this.scene.findObjectsByTag(Tags.BOMB);

        const colliders = [...solidWalls, ...breakableWalls, ...bombs];

        for (let collider of colliders) {
            const cBox = collider.getBounds();

            const horizontalIntersection = CollisionUtils.hasHorizontalIntersection(futurePosition, cBox);
            const verticalIntersection = CollisionUtils.hasVerticalIntersection(futurePosition, cBox);

            const collides = horizontalIntersection > 0 && verticalIntersection > 0;

            if (collider.hasTag(Tags.BOMB)) {
                if (this.lastPlacedBomb != null) {
                    if (this.lastPlacedBomb.x == Math.floor(cBox.x) && this.lastPlacedBomb.y == Math.floor(cBox.y)) {
                        if (collides) {
                            return false;
                        } else {
                            this.lastPlacedBomb = null;
                        }
                    }
                }
            }

            if (collides) {
                return true;
            }
        }

        return false;
    }

    private canAddBombToLocation(x: number, y: number): boolean {
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

    private addBomb(x: number, y: number) {
        this.lastPlacedBomb = {x, y};
        const bomb = new ECS.Builder(this.owner.scene)
            .localPos(x, y)
            .withTag(Tags.BOMB)
            .asSprite(TextureUtils.createTexture(8 * Config.TEXTURE_WIDTH, 18 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(this.owner.scene.stage)
            .withComponent(new BombController())
            .scale(Config.TEXTURE_SCALE)
            .build();
    }
}

export {
    PlayerController,
}