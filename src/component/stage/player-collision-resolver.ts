import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {PlayerMoveMessage} from "../player/player-controller";
import {CollisionMessage} from "./player-collision-watcher";
import {Coords} from "../../utils";
import {Config} from "../../config";

class PlayerCollisionResolver extends ECS.Component {
    private timers: number[] = [];

    onInit() {
        super.onInit();
        this.subscribe(Messages.PLAYER_COLLIDED, Messages.MOVE_PLAYER);
    }

    onMessage(msg: ECS.Message): any {
        if (msg.action == Messages.MOVE_PLAYER) {
            const movePayload = msg.data as PlayerMoveMessage;
            const {player, futureBounds} = movePayload;

            player.assignAttribute(Attrs.PLAYER_X, futureBounds.x);
            player.assignAttribute(Attrs.PLAYER_Y, futureBounds.y);
        } else if (msg.action == Messages.PLAYER_COLLIDED) {
            const collisionPayload = msg.data as CollisionMessage;
            const {player, collider, futurePosition} = collisionPayload;

            if (collider.hasTag(Tags.POWER_UP_BOMB)) {
                collider.removeTag(Tags.POWER_UP);
                collider.removeTag(Tags.POWER_UP_BOMB);

                collider.visible = false;
                this.timers.push(setTimeout(() => collider.destroy(), Config.SAFE_DESTROY));

                // TODO: send player bomb ++
            }

            if (collider.hasTag(Tags.POWER_UP_SPEED)) {
                collider.removeTag(Tags.POWER_UP);
                collider.removeTag(Tags.POWER_UP_SPEED);

                collider.visible = false;
                this.timers.push(setTimeout(() => collider.destroy(), Config.SAFE_DESTROY));

                // TODO: send player speed ++
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
    PlayerCollisionResolver,
}