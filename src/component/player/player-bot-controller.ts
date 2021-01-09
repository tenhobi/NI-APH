import * as ECS from "../../../libs/pixi-ecs";
import {PlayerController} from "./player-controller";

class PlayerBotController extends PlayerController {
    constructor(player: number = 0) {
        super(player);
    }

    onInit() {
        super.onInit();
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

    }
}

export {
    PlayerBotController,
}
