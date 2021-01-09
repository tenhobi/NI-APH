import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {CollisionUtils, Coords} from "../../utils";
import {PlayerWantsToMoveMessage} from "../player/player-controller";

class PlayerMovementResolver extends ECS.Component {
    onInit() {
        super.onInit();
        this.subscribe(Messages.PLAYER_WANTS_TO_MOVE);
    }

    onMessage(msg: ECS.Message): any {
        if (msg.action == Messages.PLAYER_WANTS_TO_MOVE) {
            const payload = msg.data as PlayerWantsToMoveMessage;
            const {player, futureBounds} = payload;

            if (!this.hasCollision(futureBounds, player)) {
                player.assignAttribute(Attrs.PLAYER_X, futureBounds.x);
                player.assignAttribute(Attrs.PLAYER_Y, futureBounds.y);
            }
        }
    }

    protected hasCollision(futurePosition: PIXI.Rectangle, player: ECS.Container) {
        const lastPlacedBomb = player.getAttribute<Coords>(Attrs.PLAYER_BOMB);

        const solidWalls = this.scene.findObjectsByTag(Tags.SOLID_WALL);
        const breakableWalls = this.scene.findObjectsByTag(Tags.BREAKABLE_WALL);
        const bombs = this.scene.findObjectsByTag(Tags.BOMB);
        const colliders = [...solidWalls, ...breakableWalls, ...bombs];

        for (let collider of colliders) {
            const playerBox = futurePosition;
            const cBox = collider.getBounds();

            const horizontalIntersection = CollisionUtils.hasHorizontalIntersection(playerBox, cBox);
            const verticalIntersection = CollisionUtils.hasVerticalIntersection(playerBox, cBox);

            const collides = horizontalIntersection > 0 && verticalIntersection > 0;

            if (collider.hasTag(Tags.BOMB)) {
                if (lastPlacedBomb != null) {
                    if (lastPlacedBomb.x == Math.floor(cBox.x) && lastPlacedBomb.y == Math.floor(cBox.y)) {
                        if (collides) {
                            return false;
                        } else {
                            player.assignAttribute(Attrs.PLAYER_BOMB, null);
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
}

export {
    PlayerMovementResolver,
}