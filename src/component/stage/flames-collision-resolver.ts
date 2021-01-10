import * as ECS from "../../../libs/pixi-ecs";
import {Messages, Tags} from "../../constants";
import {Factory} from "../../utils";
import {FlameCollisionMessage} from "./flames-collision-watcher";
import {Sprite} from "../../../libs/pixi-ecs";
import {Config} from "../../config";

type ExplodeNowMessage = {
    bomb: ECS.Container,
}

type PlayerKilledMessage = {
    player: ECS.Container,
}

class FlamesCollisionResolver extends ECS.Component {
    private timers: number[] = [];
    private factory: Factory;

    onInit() {
        super.onInit();
        this.factory = new Factory();


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

                let powerupHolder = this.scene.findObjectByTag(Tags.POWER_UP_HOLDER);

                if (Math.random() < 0.3) {
                    this.factory.createSpeedPowerup(powerupHolder.scene, powerupHolder, {x: collider.x, y: collider.y});
                } else {
                    if (Math.random() < 0.3) {
                        this.factory.createBombPowerup(powerupHolder.scene, powerupHolder, {x: collider.x, y: collider.y});
                    }
                }
            }

            if (collider.hasTag(Tags.BOMB)) {
                this.sendMessage(Messages.EXPLODE_NOW, {
                    bomb: collider,
                } as ExplodeNowMessage);
            }

            if (collider.hasTag(Tags.POWER_UP)) {
                collider.removeTag(Tags.POWER_UP);
                collider.visible = false;
                this.timers.push(setTimeout(() => collider.destroy(), Config.SAFE_DESTROY));
            }
        }
    }

    onDetach() {
        this.clearTimeouts();
    }

    public clearTimeouts() {
        for (let timer of this.timers) {
            clearTimeout(timer);
        }
    }
}

export {
    FlamesCollisionResolver,
    PlayerKilledMessage,
    ExplodeNowMessage,
}