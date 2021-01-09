import * as ECS from "../../../libs/pixi-ecs";
import {Messages} from "../../constants";
import {Message} from "../../../libs/pixi-ecs";

class GameManager extends ECS.Component {
    onInit() {
        super.onInit();
        this.subscribe(Messages.EXPLOSION_COLLIDED);
    }

    onMessage(msg: Message): any {
        if (msg.action == Messages.EXPLOSION_COLLIDED) {
            // TODO
            // - remove dead player
            // victory of player -> send message who, game clear etc.
        }
    }
}

export {
    GameManager,
}