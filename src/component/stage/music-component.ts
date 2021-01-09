import * as ECS from "../../../libs/pixi-ecs";
import {default as PIXI_SOUND} from 'pixi-sound';
import {Assets} from "../../constants";

const VOLUME: number = 0.01;

export class MusicComponent extends ECS.Component {
    onInit() {
        PIXI_SOUND.play(Assets.MUSIC_INTRO, {
            volume: VOLUME,
            complete: sound => {
                PIXI_SOUND.play(Assets.MUSIC_LOOP, {
                    volume: VOLUME,
                    loop: true,
                });
            }
        });
    }
}

