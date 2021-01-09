import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {PlayerMoveMessage} from "../player/player-controller";

class PlayerMovementResolver extends ECS.Component {
    onInit() {
        super.onInit();
        this.subscribe(Messages.MOVE_PLAYER);
    }

    onMessage(msg: ECS.Message): any {
        if (msg.action == Messages.MOVE_PLAYER) {
            const payload = msg.data as PlayerMoveMessage;
            const {player, futureBounds} = payload;

            player.assignAttribute(Attrs.PLAYER_X, futureBounds.x);
            player.assignAttribute(Attrs.PLAYER_Y, futureBounds.y);
        }
    }
}

export {
    PlayerMovementResolver,
}