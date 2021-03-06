import * as ECS from "../../../libs/pixi-ecs";
import {PlayerController} from "./player-controller";

class PlayerKeyboardController extends PlayerController {
    private readonly keyUp: number;
    private readonly keyRight: number;
    private readonly keyDown: number;
    private readonly keyLeft: number;
    private readonly keyBomb: number;

    keyInputCmp: ECS.KeyInputComponent;

    constructor(player: number = 0, keyUp: ECS.Keys, keyRight: ECS.Keys, keyDown: ECS.Keys, keyLeft: ECS.Keys, keyBomb: ECS.Keys) {
        super(player);
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
            this.moveUp(delta);
        }
        if (this.keyInputCmp.isKeyPressed(this.keyDown)) {
            this.moveDown(delta);
        }
        if (this.keyInputCmp.isKeyPressed(this.keyLeft)) {
            this.moveLeft(delta);
        }
        if (this.keyInputCmp.isKeyPressed(this.keyRight)) {
            this.moveRight(delta);
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
