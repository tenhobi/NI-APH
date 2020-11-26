import * as ECS from "../../libs/pixi-ecs";
import {default as PIXI_SOUND} from 'pixi-sound';

const VOLUME: number = 0.01;

export class MusicComponent extends ECS.Component {
    onInit() {
        PIXI_SOUND.play('music-intro', {
            volume: VOLUME,
            complete: sound => {
                PIXI_SOUND.play('music-loop', {
                    volume: VOLUME,
                    loop: true,
                });
            }
        });
    }
}
