import * as ECS from '../libs/pixi-ecs';
import {MusicComponent} from './component/music-component';
import {Config} from "./config";
import {PlayerController} from "./component/player-controller";
import {Tags} from "./tags";
import {Attrs} from "./attrs";
import {Messages} from "./messages";
import {Texture} from "pixi.js";
import {TextureUtils} from "./utils";

class Game {
    engine: ECS.Engine;

    constructor() {
        this.engine = new ECS.Engine();
        let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

        this.engine.init(canvas, {
            width: canvas.width,
            height: canvas.height,
            resolution: canvas.width / Config.SCENE_WIDTH,
        });

        this.engine.app.loader
            .reset()
            .add('spritesheet', './assets/bomb_party.png')
            .add('music-intro', './assets/music/intro.wav')
            .add('music-loop', './assets/music/loop.wav')
            .load(() => this.load());
    }

    load() {
        const scene = this.engine.scene;
        let arena = new ECS.Container('arena');
        scene.stage.addChild(arena);
        scene.addGlobalComponent(new ECS.KeyInputComponent());

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
                    sprite = new ECS.Sprite('', TextureUtils.createTexture(Config.TEXTURE_WIDTH, 0, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT));
                    sprite.addTag(Tags.SOLID_WALL);
                } else if (
                    // left wall
                    (x == 0 && y != Config.SCENE_WIDTH - 1)
                    // right wall
                    || (x == Config.SCENE_WIDTH - 1 && y != Config.SCENE_WIDTH - 1)
                ) {
                    sprite = new ECS.Sprite('', TextureUtils.createTexture(0, 0, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT));
                    sprite.addTag(Tags.SOLID_WALL);
                } else {
                    sprite = new ECS.Sprite('', TextureUtils.createTexture(3 * Config.TEXTURE_WIDTH, 3 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT));
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
                if (Game.isCellOnPlayerSpawner(emptyCell))
                    continue;

                (emptyCell as ECS.Sprite).texture = TextureUtils.createTexture(9 * Config.TEXTURE_WIDTH, 13 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT);
                emptyCell.removeTag(Tags.EMPTY);
                emptyCell.addTag(Tags.BREAKABLE_WALL);
            }
        }

        const sceneHeight = Config.SCENE_WIDTH / (this.engine.app.view.width / this.engine.app.view.height);
        scene.assignGlobalAttribute(Attrs.SCENE_HEIGHT, sceneHeight);

        new ECS.Builder(this.engine.scene)
            .anchor(0.5)
            .localPos(1.5, 1.5)
            .withTag(Tags.PLAYER)
            .asSprite(TextureUtils.createTexture(Config.TEXTURE_WIDTH, 15 * Config.TEXTURE_HEIGHT, Config.TEXTURE_WIDTH, Config.TEXTURE_HEIGHT))
            .withParent(scene.stage)
            .withComponent(new PlayerController())
            .scale(Config.TEXTURE_SCALE * 3/4)
            .build();

        scene.addGlobalComponent(new MusicComponent());
    }

    private static isCellOnPlayerSpawner(cell: PIXI.Container): boolean {
        return ((cell.x == 1 || cell.x == Config.SCENE_WIDTH - 2) && (cell.y < 3 || cell.y > Config.SCENE_WIDTH - 4)) // vertical space around spawner
            || ((cell.y == 1 || cell.y == Config.SCENE_WIDTH - 2) && (cell.x < 3 || cell.x > Config.SCENE_WIDTH - 4)) // horizontal space around spawner;
    }
}

export default new Game();