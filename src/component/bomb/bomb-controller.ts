import * as ECS from "../../../libs/pixi-ecs";
import {Config} from "../../config";
import {Attrs, Tags, Messages} from "../../constants";
import {Coords, Factory} from "../../utils";
import {Message} from "../../../libs/pixi-ecs";
import {ExplodeNowMessage} from "../stage/flames-collision-resolver";

type BombExplodedMessage = {
    player: ECS.Container,
    coords: Coords,
    power: number,
}

class BombController extends ECS.Component {
    private timer: number;
    private readonly player: ECS.Container;
    private factory: Factory;
    private bombPower: number;

    constructor(props) {
        super(null);
        this.player = props.player;
    }

    onInit() {
        this.factory = new Factory();
        this.bombPower = this.player.getAttribute<number>(Attrs.BOMB_POWER);
        this.timer = setTimeout(() => this.fireBomb(), Config.BOMB_TIMEOUT + Math.random() * Config.BOMB_TIMEOUT_DEVIATION);
        this.subscribe(Messages.EXPLODE_NOW);
    }

    onMessage(msg: Message): any {
        if (msg.action == Messages.EXPLODE_NOW) {
            let payload = msg.data as ExplodeNowMessage;
            let {bomb} = payload;

            if (bomb == this.owner) {
                this.fireBomb();
            }
        }
    }

    fireBomb() {
        this.owner.removeTag(Tags.BOMB);
        this.sendMessage(Messages.BOMB_EXPLODED, {
            player: this.player,
            coords: {x: this.owner.x, y: this.owner.y},
            power: this.bombPower,
        } as BombExplodedMessage);

        this.owner.destroy();
    }

    onDetach() {
        this.clearTimeouts();
    }

    public clearTimeouts() {
        clearTimeout(this.timer);
    }
}

export {
    BombController,
    BombExplodedMessage,
}