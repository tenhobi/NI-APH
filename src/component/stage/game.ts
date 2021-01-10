import * as ECS from "../../../libs/pixi-ecs";
import {Messages} from "../../constants";

class Game extends ECS.Component {
    onInit() {
        super.onInit();
        this.sendMessage(Messages.START_MENU, {});
    }
}

export {
    Game,
}
