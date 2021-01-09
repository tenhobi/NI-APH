import * as ECS from '../../libs/pixi-ecs';
import {Config} from "../config";
import {Attrs, Tags, Messages, Assets} from "../constants";
import {PlayerKeyboardController} from "../component/player";
import * as PIXI from "pixi.js";
import {PlayerCollisionResolver, PlayerMovementResolver} from "../component/stage";
import {GameManager} from "../component/stage";
import {PlayerBotController} from "../component/player/player-bot-controller";
import {GameLoader} from "./index";

class Factory {
    public loadGame(scene: ECS.Scene) {
        let arena = new ECS.Container('arena');
        scene.stage.addChild(arena);

        let loader = new GameLoader();
        loader.generateMap(arena, this);

        // TODO
        this.createPlayerGO(true, scene, 1, 1, 0);
        this.createPlayerGO(true, scene, 2, 1, 1, Config.KEY2_UP, Config.KEY2_RIGHT, Config.KEY2_DOWN, Config.KEY2_LEFT, Config.KEY2_BOMB);
        this.createPlayerGO(false, scene, 1, Config.SCENE_WIDTH - 2, 2, Config.KEY2_UP, Config.KEY2_RIGHT, Config.KEY2_DOWN, Config.KEY2_LEFT, Config.KEY2_BOMB);
        this.createPlayerGO(false, scene, Config.SCENE_WIDTH - 2, 1, 3);

        scene.addGlobalComponent(new GameManager());
        scene.addGlobalComponent(new PlayerCollisionResolver());
        scene.addGlobalComponent(new PlayerMovementResolver());
    }

    public createTexture(offsetX: number, offsetY: number, width: number, height: number, rotate?: number) {
        let texture = PIXI.Texture.from(Assets.SPRITESHEET);
        texture = texture.clone();
        texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
        if (rotate != null) {
            texture.rotate = rotate;
        }
        return texture;
    }

    public createPlayerGO(humanPlayer: boolean, scene: ECS.Scene, posX: number, posY: number, player: number = 0, keyUp = Config.KEY_UP, keyRight = Config.KEY_RIGHT, keyDown = Config.KEY_DOWN, keyLeft = Config.KEY_LEFT, keySpace = Config.KEY_BOMB) {
        new ECS.Builder(scene)
            .asAnimatedSprite(this.createPlayerTexturesStanding(player))
            .localPos(posX + Config.TEXTURE_SCALE, posY + Config.TEXTURE_SCALE)
            .withTag(Tags.PLAYER)
            .withParent(scene.stage)
            .withComponent(humanPlayer ? new PlayerKeyboardController(player, keyUp, keyRight, keyDown, keyLeft, keySpace) : new PlayerBotController(player))
            .scale(Config.TEXTURE_SCALE * 3 / 4)
            .build();
    }

    public createPlayerTexturesStanding(player: number = 0) {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];
        return textures;
    }

    public createPlayerTexturesUp(player: number = 0) {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(8 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(9 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];

        return textures;
    }

    public createPlayerTexturesRight(player: number = 0) {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(4 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(5 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(6 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(7 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];

        return textures;
    }

    public createPlayerTexturesDown(player: number = 0) {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(2 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(3 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];

        return textures;
    }

    public createPlayerTexturesLeft(player: number = 0) {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(4 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
            this.createTexture(5 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
            this.createTexture(6 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
            this.createTexture(7 * Config.TEXTURE_WIDTH, (14 + player) * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
        ];

        return textures;
    }
}

export {
    Factory,
}