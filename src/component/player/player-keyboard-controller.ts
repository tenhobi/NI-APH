import * as ECS from "../../../libs/pixi-ecs";
import {PlayerController} from "./player-controller";
import {Attrs} from "../../constants";

class PlayerKeyboardController extends PlayerController {
    private readonly keyUp: number;
    private readonly keyRight: number;
    private readonly keyDown: number;
    private readonly keyLeft: number;
    private readonly keyBomb: number;

    keyInputCmp: ECS.KeyInputComponent;

    constructor(keyUp: number, keyRight: number, keyDown: number, keyLeft: number, keyBomb: number) {
        super();
        this.keyUp = keyUp;
        this.keyRight = keyRight;
        this.keyDown = keyDown;
        this.keyLeft = keyLeft;
        this.keyBomb = keyBomb;
    }

    onInit() {
        super.onInit();
        this.keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        if (this.keyInputCmp.isKeyPressed(this.keyUp)) {
            this.moveUp(delta * this.owner.getAttribute<number>(Attrs.SPEED));
        }
        if (this.keyInputCmp.isKeyPressed(this.keyDown)) {
            this.moveDown(delta * this.owner.getAttribute<number>(Attrs.SPEED));
        }
        if (this.keyInputCmp.isKeyPressed(this.keyLeft)) {
            this.moveLeft(delta * this.owner.getAttribute<number>(Attrs.SPEED));
        }
        if (this.keyInputCmp.isKeyPressed(this.keyRight)) {
            this.moveRight(delta * this.owner.getAttribute<number>(Attrs.SPEED));
        }
        if (this.keyInputCmp.isKeyPressed(this.keyBomb)) {
            this.keyInputCmp.handleKey(this.keyBomb);
            this.placeBomb();
        }
    }
}

export {
    PlayerKeyboardController,
}
