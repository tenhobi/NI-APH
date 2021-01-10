import * as ECS from "../../../libs/pixi-ecs";
import {Messages, Tags} from "../../constants";
import {CollisionUtils} from "../../utils";
import {BombExplosionFinishedMessage} from "./in-game-manager";

type FlameCollisionMessage = {
    flame: ECS.Container,
    collider: ECS.Container,
};

class FlamesCollisionWatcher extends ECS.Component {
    onInit() {
        super.onInit();
        this.subscribe(Messages.BOMB_EXPLOSION_FINISHED);
    }

    onMessage(msg: ECS.Message): any {
        if (msg.action == Messages.BOMB_EXPLOSION_FINISHED) {
            const payload = msg.data as BombExplosionFinishedMessage;
            const {player} = payload;

            this.checkCollisions();
        }
    }

    protected checkCollisions() {
        const flames = this.scene.findObjectsByTag(Tags.FLAME);
        const players = this.scene.findObjectsByTag(Tags.PLAYER);
        const breakableWalls = this.scene.findObjectsByTag(Tags.BREAKABLE_WALL);
        const powerups = this.scene.findObjectsByTag(Tags.POWER_UP);
        const bombs = this.scene.findObjectsByTag(Tags.BOMB);

        const colliders = [...players, ...breakableWalls, ...powerups, ...bombs];

        for (let flame of flames) {
            for (let collider of colliders) {
                const flameBox = flame.getBounds();
                const cBox = collider.getBounds();

                const horizontalIntersection = CollisionUtils.hasHorizontalIntersection(flameBox, cBox);
                const verticalIntersection = CollisionUtils.hasVerticalIntersection(flameBox, cBox);

                const collides = horizontalIntersection > 0 && verticalIntersection > 0;

                // Resolve collision.
                if (collides) {
                    this.sendMessage(Messages.EXPLOSION_COLLIDED, {
                        flame: flame,
                        collider: collider,
                    } as FlameCollisionMessage);
                }
            }
        }
    }
}

export {
    FlamesCollisionWatcher,
    FlameCollisionMessage,
}