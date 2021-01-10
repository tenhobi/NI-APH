import * as ECS from '../../libs/pixi-ecs';
import {Config} from "../config";
import {Tags} from "../constants";
import * as PIXI from "pixi.js";
import {Factory} from "./factory";

class GameLoader {
    private boxPst: number;

    constructor(boxPst: number) {
        this.boxPst = boxPst;
    }

    public generateMap(arena: ECS.Container, factory: Factory) {
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
                    sprite = new ECS.Sprite('', factory.createSolidWallTexture());
                    sprite.addTag(Tags.SOLID_WALL);
                } else if (
                    // left wall
                    (x == 0 && y != Config.SCENE_WIDTH - 1)
                    // right wall
                    || (x == Config.SCENE_WIDTH - 1 && y != Config.SCENE_WIDTH - 1)
                ) {
                    sprite = new ECS.Sprite('', factory.createSolidWallTexture());
                    sprite.addTag(Tags.SOLID_WALL);
                } else {
                    sprite = new ECS.Sprite('', factory.createEmptyTexture());
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
            if (Math.random() < this.boxPst) {
                if (GameLoader.isCellOnPlayerSpawner(emptyCell))
                    continue;

                (emptyCell as ECS.Sprite).texture = factory.createBreakableWallTexture();
                emptyCell.removeTag(Tags.EMPTY);
                emptyCell.addTag(Tags.BREAKABLE_WALL);
            }
        }
    }

    private static isCellOnPlayerSpawner(cell: PIXI.Container): boolean {
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
}

export {
    GameLoader,
}