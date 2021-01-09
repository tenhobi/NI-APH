import * as ECS from "../../../libs/pixi-ecs";
import {Config} from "../../config";
import {Tags} from "../../constants";
import {Coords, Factory} from "../../utils";

class FlameController extends ECS.Component {
    private timers: number[] = [];
    private flames: ECS.Container[] = [];

    private readonly initialCoords: Coords;
    private readonly power: number;
    private factory: Factory;

    constructor(props: { coords: Coords, power: number }) {
        super(null);
        this.initialCoords = props.coords;
        this.power = props.power;
    }

    onInit() {
        this.factory = new Factory();
        this.createFlames();
        this.timers.push(setTimeout(() => this.finishFlames(), Config.BOMB_FLAME_LIVING_TIME));
    }

    createFlames() {
        this.flames.push(this.factory.createFlame(this.owner.scene, this.owner, this.initialCoords)); // initial

        this.createFlameRecursion({x: this.initialCoords.x + 1, y: this.initialCoords.y}, {x: 1, y: 0}, this.power); // right
        this.createFlameRecursion({x: this.initialCoords.x + -1, y: this.initialCoords.y}, {x: -1, y: 0}, this.power); // left
        this.createFlameRecursion({x: this.initialCoords.x, y: this.initialCoords.y + 1}, {x: 0, y: 1}, this.power); // down
        this.createFlameRecursion({x: this.initialCoords.x, y: this.initialCoords.y - 1}, {x: 0, y: -1}, this.power); // up
    }

    createFlameRecursion(coords: Coords, vector: Coords, power: number) {
        if (this.isEmptyCell(coords)) {
            this.flames.push(this.factory.createFlame(this.owner.scene, this.owner, coords));

            if (power > 1) {
                this.createFlameRecursion({x: coords.x + vector.x, y: coords.y + vector.y}, vector, power);
            }
        }

        if (this.isBreakableWall(coords)) {
            this.flames.push(this.factory.createFlame(this.owner.scene, this.owner, coords));
            return;
        }
    }

    private isEmptyCell(coords: Coords): boolean {
        const emptyCells = this.scene.findObjectsByTag(Tags.EMPTY);

        for (let cell of emptyCells) {
            if (cell.x == coords.x && cell.y == coords.y) {
                return true;
            }
        }

        return false;
    }

    private isBreakableWall(coords: Coords): boolean {
        const walls = this.scene.findObjectsByTag(Tags.BREAKABLE_WALL);

        for (let wall of walls) {
            if (wall.x == coords.x && wall.y == coords.y) {
                return true;
            }
        }

        return false;
    }

    finishFlames() {
        for (let flame of this.flames) {
            flame.visible = false;
            flame.removeTag(Tags.FLAME);
        }
        this.timers.push(setTimeout(() => this.owner?.destroy(), Config.SAFE_DESTROY));
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
    FlameController,
}