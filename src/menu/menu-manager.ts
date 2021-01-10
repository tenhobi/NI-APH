import * as ECS from "../../libs/pixi-ecs";
import {Message} from "../../libs/pixi-ecs";
import {Messages} from "../constants";
import {Config} from "../config";
import {StartMenuMessage} from "../component/stage/in-game-manager";

type StartGameMessage = {
    humanPlayersCount: number,
    pst: number,
}

class MenuManager extends ECS.Component {
    keyInputCmp: ECS.KeyInputComponent;
    private inMenu: boolean;

    private humanPlayersCount: number;
    private pst: number;

    private playersValueText: PIXI.Text;
    private pstValueText: PIXI.Text;
    private lastGameWinnerText: PIXI.Text;
    private lastGameWinner: ECS.Container;

    onInit() {
        super.onInit();
        this.subscribe(Messages.START_MENU);
        this.keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name);
        this.inMenu = false;
        this.humanPlayersCount = 1;
        this.pst = 0.6;

        let playersText = new PIXI.Text(Config.TEXT_PLAYERS, new PIXI.TextStyle({fontSize: 0.5}));
        playersText.position.set(1, 5);
        this.playersValueText = new PIXI.Text(this.humanPlayersCount.toString(), new PIXI.TextStyle({fontSize: 0.5}));
        this.playersValueText.position.set(9, 5);
        let pstText = new PIXI.Text(Config.TEXT_PST, new PIXI.TextStyle({fontSize: 0.5}));
        pstText.position.set(1, 7);
        this.pstValueText = new PIXI.Text(this.pst.toString(), new PIXI.TextStyle({fontSize: 0.5}));
        this.pstValueText.position.set(9, 7);

        let titleText = new PIXI.Text(Config.TEXT_TITLE, new PIXI.TextStyle({fontSize: 0.8}));
        titleText.position.set(1, 1);

        let enterGameText = new PIXI.Text(Config.TEXT_ENTER_GAME, new PIXI.TextStyle({fontSize: 0.8}));
        enterGameText.position.set(1, 12);

        this.lastGameWinnerText = new PIXI.Text("", new PIXI.TextStyle({fontSize: 0.5}));
        this.lastGameWinnerText.position.set(1, 10);
        this.lastGameWinner = null;

        this.owner.addChild(playersText);
        this.owner.addChild(pstText);
        this.owner.addChild(titleText);
        this.owner.addChild(enterGameText);
        this.owner.addChild(this.playersValueText);
        this.owner.addChild(this.pstValueText);
        this.owner.addChild(this.lastGameWinnerText);
    }

    onMessage(msg: Message): any {
        if (msg.action == Messages.START_MENU) {
            this.inMenu = true;

            let payload = msg.data as StartMenuMessage;
            let { player } = payload;
            this.lastGameWinner = player;
        }
    }

    private updateTexts() {
        this.playersValueText.text = this.humanPlayersCount.toString();
        this.pstValueText.text = this.pst.toString();

        this.lastGameWinnerText.text = this.lastGameWinner == null ? "" : (Config.TEXT_WINNER + ": " + this.lastGameWinner.name);
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        if (!this.inMenu) return;

        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_UP)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_UP);

            this.humanPlayersCount++;
            if (this.humanPlayersCount > 2) {
                this.humanPlayersCount = 2;
            }
        }
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_DOWN)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_DOWN);

            this.humanPlayersCount--;

            if (this.humanPlayersCount < 1) {
                this.humanPlayersCount = 1;
            }
        }
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_LEFT)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_LEFT);

            this.pst -= 0.05;

            if (this.pst < 0.1) {
                this.pst = 0.1;
            }
        }
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_RIGHT)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_RIGHT);

            this.pst += 0.05;

            if (this.pst > 0.8) {
                this.pst = 0.8;
            }
        }
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_ENTER)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_ENTER);

            this.sendMessage(Messages.START_GAME, {
                humanPlayersCount: this.humanPlayersCount,
                pst: this.pst,
            } as StartGameMessage);
            this.inMenu = false;
        }

        this.pst = Math.round(this.pst * 100) / 100
        this.updateTexts();
    }
}

export {
    MenuManager,
    StartGameMessage,
}