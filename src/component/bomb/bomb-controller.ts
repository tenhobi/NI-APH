import * as ECS from "../../../libs/pixi-ecs";
import {Config} from "../../config";
import {Attrs, Tags, Messages} from "../../constants";
import {Factory} from "../../utils";

class BombController extends ECS.Component {
    private timers: number[] = [];

    onInit() {
        this.timers.push(setTimeout(() => this.fireBomb(), Config.BOMB_TIMEOUT + Math.random() * Config.BOMB_TIMEOUT_DEVIATION));
    }

    onUpdate(delta: number, absolute: number) {

    }

    fireBomb() {
        this.addFlame(this.owner.x, this.owner.y);
    }

    finishExplosion() {
        this.owner.destroy();
    }

    onDetach() {
        for (let timer of this.timers) {
            clearTimeout(timer);
        }
    }

    // TODO:
    private addFlame(x, y) {
        const flame = new ECS.Builder(this.scene)
            .relativePos(0, 0)
            .withName('flame')
            .withTag(Tags.FLAME)
            .asSprite(Factory.createTexture(2 * Config.TEXTURE_WIDTH, 18 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(this.owner)
            .build();

        this.timers.push(setTimeout(() => this.finishExplosion(), Config.BOMB_FLAME_LIVING_TIME));
    }
}

export {
    BombController,
}