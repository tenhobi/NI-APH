import * as ECS from "../../../libs/pixi-ecs";
import {Attrs, Messages, Tags} from "../../constants";
import {Message} from "../../../libs/pixi-ecs";
import {Coords, Factory} from "../../utils";
import {BombExplodedMessage} from "../bomb/bomb-controller";
import {PlaceBombMessage} from "../player/player-controller";
import {FlameController} from "../bomb";
import {FlameCollisionMessage} from "./flames-collision-watcher";
import {PlayerKilledMessage} from "./flames-collision-resolver";
import {Config} from "../../config";
import {StartGameMessage} from "../../menu/menu-manager";

type BombExplosionFinishedMessage = {
    player: ECS.Container,
}

type BombPlacedMessage = {
    player: ECS.Container,
}

type StartMenuMessage = {
    player: ECS.Container,
}

/**
 * Manages game such as placing bombs, detecting explosions, killing players and finishing game.
 */
class InGameManager extends ECS.Component {
    private timers: number[] = [];
    private bombHolder: ECS.Container;
    private arena: ECS.Container;
    private factory: Factory;

    onInit() {
        super.onInit();
        this.subscribe(
            Messages.EXPLOSION_COLLIDED,
            Messages.BOMB_PLACE,
            Messages.BOMB_EXPLODED,
            Messages.EXPLOSION_COLLIDED,
            Messages.PLAYER_KILLED,
            Messages.START_GAME,
        );
        this.factory = new Factory();
    }

    private loadHolders() {
        this.bombHolder = this.scene.findObjectByTag(Tags.BOMB_HOLDER);
        this.arena = this.scene.findObjectByTag(Tags.ARENA);
    }

    private createGame(humanPlayersCount: number, pst: number) {
        this.factory.loadGame(this.scene, humanPlayersCount, pst);
        this.loadHolders();
    }

    private destroyGame() {
        this.arena.destroy();
    }

    onMessage(msg: Message): any {
        if (msg.action == Messages.START_GAME) {
            let payload = msg.data as StartGameMessage;
            let {humanPlayersCount, pst} = payload;
            this.createGame(humanPlayersCount, pst);
        } else if (msg.action == Messages.EXPLOSION_COLLIDED) {
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

            const players = this.scene.findObjectsByTag(Tags.PLAYER);

            if (players.length == 1) {
                this.sendMessage(Messages.START_MENU, {
                    player: players[0],
                } as StartMenuMessage);

                this.arena.removeTag(Tags.ARENA);
                let objects = [...this.scene.findObjectsByTag(Tags.PLAYER), ...this.scene.findObjectsByTag(Tags.SOLID_WALL), ...this.scene.findObjectsByTag(Tags.BREAKABLE_WALL), ...this.scene.findObjectsByTag(Tags.BOMB), ...this.scene.findObjectsByTag(Tags.POWER_UP), ...this.scene.findObjectsByTag(Tags.EMPTY)];
                for (let object of objects) {
                    object.removeTag(Tags.EMPTY);
                    object.removeTag(Tags.BREAKABLE_WALL);
                    object.removeTag(Tags.SOLID_WALL);
                    object.removeTag(Tags.PLAYER);
                    object.removeTag(Tags.BOMB);
                    object.removeTag(Tags.POWER_UP);
                }
                this.arena.visible = false;
                this.timers.push(setTimeout(() => this.destroyGame(), Config.SAFE_DESTROY));
            }
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

    onDetach() {
        this.clearTimeouts();
    }

    public clearTimeouts() {
        for (let timer of this.timers) {
            clearTimeout(timer);
        }
    }
}

export {
    InGameManager,
    BombPlacedMessage,
    BombExplosionFinishedMessage,
    StartMenuMessage,
}