import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {CollisionUtils, Coords} from "../../utils";
import {PlayerMoveMessage} from "../player/player-controller";

type CollisionMessage = {
    player: ECS.Container,
    collider: ECS.Container,
    futurePosition: PIXI.Rectangle,
}

class PlayerCollisionWatcher extends ECS.Component {
    onInit() {
        super.onInit();
        this.subscribe(Messages.PLAYER_WANTS_TO_MOVE);
    }

    onMessage(msg: ECS.Message): any {
        if (msg.action == Messages.PLAYER_WANTS_TO_MOVE) {
            const payload = msg.data as PlayerMoveMessage;
            const {player, futureBounds} = payload;

            this.checkCollisions(futureBounds, player);
        }
    }

    protected checkCollisions(futurePosition: PIXI.Rectangle, player: ECS.Container) {
        const solidWalls = this.scene.findObjectsByTag(Tags.SOLID_WALL);
        const breakableWalls = this.scene.findObjectsByTag(Tags.BREAKABLE_WALL);
        const bombs = this.scene.findObjectsByTag(Tags.BOMB);
        const powerups = this.scene.findObjectsByTag(Tags.POWER_UP);
        const colliders = [...solidWalls, ...breakableWalls, ...bombs, ...powerups];

        for (let collider of colliders) {
            const playerBox = futurePosition;
            const cBox = collider.getBounds();

            const horizontalIntersection = CollisionUtils.hasHorizontalIntersection(playerBox, cBox);
            const verticalIntersection = CollisionUtils.hasVerticalIntersection(playerBox, cBox);

            const collides = horizontalIntersection > 0 && verticalIntersection > 0;
            let skip = false;

            const lastPlacedBomb = player.getAttribute<Coords>(Attrs.LAST_PLAYER_BOMB);
            if (collider.hasTag(Tags.BOMB)) {
                if (lastPlacedBomb != null) {
                    if (lastPlacedBomb.x == Math.floor(collider.getBounds().x) && lastPlacedBomb.y == Math.floor(collider.getBounds().y)) {
                        if (collides) {
                            skip = true;
                        } else {
                            player.assignAttribute(Attrs.LAST_PLAYER_BOMB, null);
                        }
                    }
                }
            }

            // Resolve collision.
            if (!skip && collides) {
                this.sendMessage(Messages.PLAYER_COLLIDED, {
                    player: player,
                    collider: collider,
                    futurePosition: futurePosition,
                } as CollisionMessage);
                return;
            }
        }

        // Let player move.
        this.sendMessage(Messages.MOVE_PLAYER, {
            player: player,
            futureBounds: futurePosition,
        } as PlayerMoveMessage);
    }
}

export {
    PlayerCollisionWatcher,
    CollisionMessage,
}