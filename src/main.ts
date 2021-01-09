import * as ECS from '../libs/pixi-ecs';
import {MusicComponent} from './component/stage/music-component';
import {Config} from "./config";
import {Attrs, Tags, Messages, Assets} from "./constants";
import {Factory} from "./utils";

class Game {
    engine: ECS.Engine;

    constructor() {
        this.engine = new ECS.Engine();
        let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

        this.engine.init(canvas, {
            width: canvas.width,
            height: canvas.height,
            resolution: canvas.width / Config.SCENE_WIDTH,
            resizeToScreen: true,
        });

        const sceneHeight = Config.SCENE_WIDTH / (this.engine.app.view.width / this.engine.app.view.height);
        this.engine.app.loader
            .reset()
            .add(Assets.SPRITESHEET, './assets/bomb_party.png')
            .add(Assets.MUSIC_INTRO, './assets/music/intro.wav')
            .add(Assets.MUSIC_LOOP, './assets/music/loop.wav')
            .load(() => this.engine.scene.addGlobalComponentAndRun(new ECS.KeyInputComponent()))
            .load(() => this.engine.scene.addGlobalComponentAndRun(new MusicComponent()))
            .load(() => this.loadGame());

        this.engine.scene.assignGlobalAttribute(Attrs.SCENE_HEIGHT, sceneHeight);
    }

    loadGame() {
        new Factory().loadGame(this.engine.scene);
    }
}

export default new Game();