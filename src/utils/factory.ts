import * as ECS from '../../libs/pixi-ecs';
import {Config} from "../config";
import {Tags, Assets} from "../constants";
import {PlayerKeyboardController} from "../component/player";
import * as PIXI from "pixi.js";
import {
    PlayerCollisionWatcher,
    PlayerCollisionResolver,
    FlamesCollisionResolver,
    GameManager,
    FlamesCollisionWatcher
} from "../component/stage";
import {PlayerBotController} from "../component/player";
import {Coords, GameLoader} from "./index";
import {BombController} from "../component/bomb";

class Factory {
    public loadGame(scene: ECS.Scene) {
        let arena = new ECS.Container('arena');
        scene.stage.addChild(arena);

        let loader = new GameLoader();
        loader.generateMap(arena, this);

        let powerupHolder = new ECS.Container('powerup holder');
        powerupHolder.addTag(Tags.POWER_UP_HOLDER);
        arena.addChild(powerupHolder);

        let bombHolder = new ECS.Container('bomb holder');
        bombHolder.addTag(Tags.BOMB_HOLDER);
        arena.addChild(bombHolder);

        // TODO
        this.createPlayerGO(true, arena.scene, 1, 1, 0);
        this.createPlayerGO(true, arena.scene, 2, 1, 1, Config.KEY2_UP, Config.KEY2_RIGHT, Config.KEY2_DOWN, Config.KEY2_LEFT, Config.KEY2_BOMB);
        this.createPlayerGO(false, arena.scene, 1, Config.SCENE_WIDTH - 2, 2, Config.KEY2_UP, Config.KEY2_RIGHT, Config.KEY2_DOWN, Config.KEY2_LEFT, Config.KEY2_BOMB);
        this.createPlayerGO(false, arena.scene, Config.SCENE_WIDTH - 2, 1, 3);

        scene.addGlobalComponent(new GameManager());
        scene.addGlobalComponent(new PlayerCollisionWatcher());
        scene.addGlobalComponent(new PlayerCollisionResolver());
        scene.addGlobalComponent(new FlamesCollisionWatcher());
        scene.addGlobalComponent(new FlamesCollisionResolver());
    }

    /// --- GO

    public createTexture(offsetX: number, offsetY: number, width: number, height: number, rotate?: number) {
        let texture = PIXI.Texture.from(Assets.SPRITESHEET);
        texture = texture.clone();
        texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
        if (rotate != null) {
            texture.rotate = rotate;
        }
        return texture;
    }

    public createBomb(holder: ECS.Scene, parent: ECS.Container, coords: Coords, player: ECS.Container) {
        new ECS.Builder(holder)
            .withName("bomb")
            .localPos(coords.x, coords.y)
            .withTag(Tags.BOMB)
            .asSprite(this.createTexture(8 * Config.TEXTURE_WIDTH, 18 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(parent)
            .withComponent(new BombController({player: player}))
            .scale(Config.TEXTURE_SCALE)
            .build();
    }

    public createFlame(scene: ECS.Scene, parent: ECS.Container, coords: Coords) {
        return new ECS.Builder(scene)
            .localPos(coords.x, coords.y)
            .withName('flame')
            .withTag(Tags.FLAME)
            .asSprite(this.createTexture(2 * Config.TEXTURE_WIDTH, 18 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(parent)
            .scale(Config.TEXTURE_SCALE)
            .build();
    }

    public createSpeedPowerup(scene: ECS.Scene, parent: ECS.Container, coords: Coords) {
        new ECS.Builder(scene)
            .localPos(coords.x, coords.y)
            .withName('speed powerup')
            .withTag(Tags.POWER_UP)
            .withTag(Tags.POWER_UP_SPEED)
            .asSprite(this.createTexture(14 * Config.TEXTURE_WIDTH, 16 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(parent)
            .scale(Config.TEXTURE_SCALE)
            .build();
    }

    public createBombPowerup(scene: ECS.Scene, parent: ECS.Container, coords: Coords) {
        new ECS.Builder(scene)
            .localPos(coords.x, coords.y)
            .withName('bomb powerup')
            .withTag(Tags.POWER_UP)
            .withTag(Tags.POWER_UP_BOMB)
            .asSprite(this.createTexture(11 * Config.TEXTURE_WIDTH, 16 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(parent)
            .scale(Config.TEXTURE_SCALE)
            .build();
    }

    public createPlayerGO(humanPlayer: boolean, scene: ECS.Scene, posX: number, posY: number, player: number = 0, keyUp = Config.KEY_UP, keyRight = Config.KEY_RIGHT, keyDown = Config.KEY_DOWN, keyLeft = Config.KEY_LEFT, keySpace = Config.KEY_BOMB) {
        new ECS.Builder(scene)
            .withName("player " + player)
            .asAnimatedSprite(this.createPlayerTexturesStanding(player))
            .localPos(posX + Config.TEXTURE_SCALE, posY + Config.TEXTURE_SCALE)
            .withTag(Tags.PLAYER)
            .withParent(scene.stage)
            .withComponent(humanPlayer ? new PlayerKeyboardController(player, keyUp, keyRight, keyDown, keyLeft, keySpace) : new PlayerBotController(player))
            .scale(Config.TEXTURE_SCALE * 3 / 4)
            .build();
    }

    /// ---- TEXTURES

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

    public createSolidWallTexture() {
        return this.createTexture(0, 0, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT);
    }

    public createEmptyTexture() {
        return this.createTexture(3 * Config.TEXTURE_WIDTH, 3 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT);
    }

    public createBreakableWallTexture() {
        return this.createTexture(9 * Config.TEXTURE_WIDTH, 13 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT);
    }
}

export {
    Factory,
}