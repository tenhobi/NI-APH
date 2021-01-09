import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {Message} from "../../../libs/pixi-ecs";
import {Coords, Factory} from "../../utils";
import {BombExplodedMessage} from "../bomb/bomb-controller";
import {PlaceBombMessage} from "../player/player-controller";
import {FlameController} from "../bomb";
import {FlameCollisionMessage} from "./flames-collision-watcher";
import {PlayerKilledMessage} from "./flames-collision-resolver";

type BombExplosionFinishedMessage = {
    player: ECS.Container,
}

type BombPlacedMessage = {
    player: ECS.Container,
}

/**
 * Manages game such as placing bombs, detecting explosions, killing players and finishing game.
 */
class GameManager extends ECS.Component {
    private bombHolder: ECS.Container;
    private factory: Factory;

    onInit() {
        super.onInit();
        this.bombHolder = this.scene.findObjectByTag(Tags.BOMB_HOLDER);
        this.subscribe(
            Messages.EXPLOSION_COLLIDED,
            Messages.BOMB_PLACE,
            Messages.BOMB_EXPLODED,
            Messages.EXPLOSION_COLLIDED,
            Messages.PLAYER_KILLED
        );
        this.factory = new Factory();
    }

    onMessage(msg: Message): any {
        if (msg.action == Messages.EXPLOSION_COLLIDED) {
            // TODO -- remove?
            let payload = msg.data as FlameCollisionMessage;
            let {flame, collider} = payload;

            // TODO
            // - remove dead player
            // victory of player -> send message who, game clear etc.
        } else if (msg.action == Messages.BOMB_PLACE) {
            let payload = msg.data as PlaceBombMessage;
            let {player, coords} = payload;

            if (this.canAddBombToLocation(coords)) {
                this.addBomb(player, coords)
            }
        } else if (msg.action == Messages.BOMB_EXPLODED) {
            let payload = msg.data as BombExplodedMessage;
            let {player, coords, power} = payload;

            let flames = new ECS.Container();
            flames.addComponent(new FlameController({coords, power}));
            this.bombHolder.addChild(flames);

            this.sendMessage(Messages.BOMB_EXPLOSION_FINISHED, {
                player: player,
            } as BombExplosionFinishedMessage);
        } else if (msg.action == Messages.PLAYER_KILLED) {
            let payload = msg.data as PlayerKilledMessage;
            let {player} = payload;

            player.assignAttribute(Attrs.PLAYING, false);
            player.removeTag(Tags.PLAYER);
        }
    }

    private canAddBombToLocation(coords: Coords): boolean {
        const bombs = this.scene.findObjectsByTag(Tags.BOMB);
        const emptyCells = this.scene.findObjectsByTag(Tags.EMPTY);

        // Is there another bomb?
        for (let bomb of bombs) {
            if (bomb.x == coords.x && bomb.y == coords.y) {
                return false;
            }
        }

        let isEmptyCell = false;
        // Is empty cell?
        for (let cell of emptyCells) {
            if (cell.x == coords.x && cell.y == coords.y) {
                isEmptyCell = true;
                break;
            }
        }

        return isEmptyCell;
    }

    private addBomb(player: ECS.Container, coords: Coords) {
        player.assignAttribute(Attrs.LAST_PLAYER_BOMB, coords);
        this.factory.createBomb(this.bombHolder.scene, this.bombHolder, coords, player);
        this.sendMessage(Messages.BOMB_PLACED, {
            player: player,
        } as BombPlacedMessage);
    }
}

export {
    GameManager,
    BombPlacedMessage,
    BombExplosionFinishedMessage,
}