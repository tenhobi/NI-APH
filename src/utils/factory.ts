import * as ECS from '../../libs/pixi-ecs';
import {MusicComponent} from '../component/stage/music-component';
import {Config} from "../config";
import {Attrs, Tags, Messages, Assets} from "../constants";
import {Texture} from "pixi.js";
import {PlayerKeyboardController} from "../component/player";
import * as PIXI from "pixi.js";
import {PlayerMovementResolver} from "../component/stage/player-movement-resolver";
import {GameManager} from "../component/stage/game-manager";

class Factory {
    static loadGame(scene: ECS.Scene) {
        let arena = new ECS.Container('arena');
        scene.stage.addChild(arena);

        // Generate map.
        for (let x = 0; x < Config.SCENE_WIDTH; x++) {
            for (let y = 0; y < Config.SCENE_WIDTH; y++) {
                let sprite: ECS.Sprite;

                // solid walls
                if (
                    // top wall
                    (y == 0 && x != 0 && x != Config.SCENE_WIDTH - 1)
                    // down wall
                    || (y == Config.SCENE_WIDTH - 1)
                    // inside
                    || (x > 0 && x < Config.SCENE_WIDTH - 1 && y > 0 && y < Config.SCENE_WIDTH - 1 && x % 2 == 0 && y % 2 == 0)
                ) {
                    sprite = new ECS.Sprite('', Factory.createTexture(Config.TEXTURE_WIDTH, 0, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT));
                    sprite.addTag(Tags.SOLID_WALL);
                } else if (
                    // left wall
                    (x == 0 && y != Config.SCENE_WIDTH - 1)
                    // right wall
                    || (x == Config.SCENE_WIDTH - 1 && y != Config.SCENE_WIDTH - 1)
                ) {
                    sprite = new ECS.Sprite('', Factory.createTexture(0, 0, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT));
                    sprite.addTag(Tags.SOLID_WALL);
                } else {
                    sprite = new ECS.Sprite('', Factory.createTexture(3 * Config.TEXTURE_WIDTH, 3 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT));
                    sprite.addTag(Tags.EMPTY);
                }

                sprite.scale.set(Config.TEXTURE_SCALE);
                sprite.position.x = x;
                sprite.position.y = y;
                arena.addChild(sprite);
            }
        }

        // Add breakable walls.
        for (let emptyCell of arena.scene.findObjectsByTag(Tags.EMPTY)) {
            if (Math.random() > Config.BREAKABLE_WALLS_CHANCE) {
                if (_isCellOnPlayerSpawner(emptyCell))
                    continue;

                (emptyCell as ECS.Sprite).texture = Factory.createTexture(9 * Config.TEXTURE_WIDTH, 13 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT);
                emptyCell.removeTag(Tags.EMPTY);
                emptyCell.addTag(Tags.BREAKABLE_WALL);
            }
        }

        this.createPlayerGO(scene, 1, 1);

        scene.addGlobalComponent(new GameManager());
        // TODO
        scene.addGlobalComponent(new PlayerMovementResolver());
    }

    static createTexture(offsetX: number, offsetY: number, width: number, height: number, rotate?: number) {
        let texture = PIXI.Texture.from(Assets.SPRITESHEET);
        texture = texture.clone();
        texture.frame = new PIXI.Rectangle(offsetX, offsetY, width, height);
        if (rotate != null) {
            texture.rotate = rotate;
        }
        return texture;
    }

    static createPlayerGO(scene: ECS.Scene, posX: number, posY: number) {
        new ECS.Builder(scene)
            .asAnimatedSprite(this.createPlayerTexturesStanding())
            .localPos(posX + Config.TEXTURE_SCALE, posY + Config.TEXTURE_SCALE)
            .withTag(Tags.PLAYER)
            .withParent(scene.stage)
            .withComponent(new PlayerKeyboardController(Config.PLAYER_UP, Config.PLAYER_RIGHT, Config.PLAYER_DOWN, Config.PLAYER_LEFT, Config.PLAYER_BOMB))
            .scale(Config.TEXTURE_SCALE * 3/4)
            .build();
    }

    static createPlayerTexturesStanding() {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];
        return textures;
    }

    static createPlayerTexturesUp() {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(8 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(9 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];

        return textures;
    }

    static createPlayerTexturesRight() {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(4 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(5 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(6 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(7 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];

        return textures;
    }

    static createPlayerTexturesDown() {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(2 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
            this.createTexture(3 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT),
        ];

        return textures;
    }

    static createPlayerTexturesLeft() {
        let textures: Array<PIXI.Texture> = [
            this.createTexture(4 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
            this.createTexture(5 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
            this.createTexture(6 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
            this.createTexture(7 * Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT, 12),
        ];

        return textures;
    }
}

function _isCellOnPlayerSpawner(cell: PIXI.Container): boolean {
    const spawners: Array<Array<number>> = [[1, 1], [1, Config.SCENE_WIDTH - 2], [Config.SCENE_WIDTH - 2, 1], [Config.SCENE_WIDTH - 2, Config.SCENE_WIDTH - 2]];

    const relativeClear: Array<Array<number>> = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

    for (let i = 0; i < spawners.length; i++) {
        for (let j = 0; j < relativeClear.length; j++) {
            if (cell.x == spawners[i][0] + relativeClear[j][0] && cell.y == spawners[i][1] + relativeClear[j][1]) {
                return true;
            }
        }
    }

    return false;
}

export {
    Factory,
}