import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {PlayerMoveMessage} from "../player/player-controller";
import {CollisionMessage} from "./player-collision-watcher";
import {Coords, Factory} from "../../utils";
import {FlameCollisionMessage} from "./flames-collision-watcher";
import {Sprite} from "../../../libs/pixi-ecs";
import {Config} from "../../config";
import {BombPlacedMessage} from "./game-manager";

type ExplodeNowMessage = {
    bomb: ECS.Container,
}

type PlayerKilledMessage = {
    player: ECS.Container,
}

class FlamesCollisionResolver extends ECS.Component {
    private factory: Factory;
    private powerupHolder: ECS.Container;

    onInit() {
        super.onInit();
        this.factory = new Factory();
        this.powerupHolder = this.scene.findObjectByTag(Tags.POWER_UP_HOLDER);

        this.subscribe(Messages.EXPLOSION_COLLIDED);
    }

    onMessage(msg: ECS.Message): any {
        if (msg.action == Messages.EXPLOSION_COLLIDED) {
            const movePayload = msg.data as FlameCollisionMessage;
            const {flame, collider} = movePayload;

            if (collider.hasTag(Tags.PLAYER)) {
                this.sendMessage(Messages.PLAYER_KILLED, {
                    player: collider,
                } as PlayerKilledMessage)
            }

            if (collider.hasTag(Tags.BREAKABLE_WALL)) {
                (collider as Sprite).texture = this.factory.createEmptyTexture();
                collider.removeTag(Tags.BREAKABLE_WALL);
                collider.addTag(Tags.EMPTY);

                if (Math.random() < 0.3) {
                    this.factory.createSpeedPowerup(this.powerupHolder.scene, this.powerupHolder, {x: collider.x, y: collider.y});
                } else {
                    if (Math.random() < 0.3) {
                        this.factory.createBombPowerup(this.powerupHolder.scene, this.powerupHolder, {x: collider.x, y: collider.y});
                    }
                }
            }

            if (collider.hasTag(Tags.BOMB)) {
                this.sendMessage(Messages.EXPLODE_NOW, {
                    bomb: collider,
                } as ExplodeNowMessage);
            }

            if (collider.hasTag(Tags.POWER_UP)) {
                // TODO
            }
        }
    }
}

export {
    FlamesCollisionResolver,
    PlayerKilledMessage,
    ExplodeNowMessage,
}