import * as ECS from '../libs/pixi-ecs';
import {MusicComponent} from './component/stage';
import {Config} from "./config";
import {Attrs, Assets, Tags} from "./constants";
import {
    FlamesCollisionResolver,
    FlamesCollisionWatcher,
    InGameManager,
    PlayerCollisionResolver,
    PlayerCollisionWatcher
} from "./component/stage";
import {Game} from "./component/stage";
import {MenuManager} from "./menu/menu-manager";
import {Factory} from "./utils";
import * as PIXI from "pixi.js";
import {MenuItem} from "./menu/menu-item";

class Main {
    engine: ECS.Engine;

    constructor() {
        this.engine = new ECS.Engine();
        let canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

        this.engine.init(canvas, {
            width: canvas.width,
            height: canvas.height,
            resolution: canvas.width / Config.SCENE_WIDTH,
            resizeToScreen: true,
            backgroundColor: 0xaaaaaa,
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
        let factory = new Factory();
        let game = factory.createGame(this.engine.scene);
        let menu = factory.createMenu(this.engine.scene);
        this.engine.scene.addGlobalComponent(new Game());
    }
}

export default new Main();
