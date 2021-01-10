import {PlayerController} from "./player-controller";
import {Coords} from "../../utils";
import {Messages, Tags} from "../../constants";
import * as ECS from "../../../libs/pixi-ecs";
import {Message} from "../../../libs/pixi-ecs";
import {CollisionMessage} from "../stage/player-collision-watcher";
import {Config} from "../../config";

type QueueBFS = {
    coords: Coords,
    from: number, // 1 - top, 2 - right, 3 - down, 4 - left
}

class Queue<T> {
    _store: T[] = [];

    push(val: T) {
        this._store.push(val);
    }

    pop(): T | undefined {
        return this._store.shift();
    }

    length(): number {
        return this._store.length;
    }
}

enum PlanType {
    MOVE,
    PLANT,
}

class PlayerBotController extends PlayerController {
    private planInterval: number;

    private plan: PlanType;
    private planCoords: Coords;

    constructor(player: number = 0) {
        super(player);
    }

    onInit() {
        super.onInit();
        this.planInterval = setInterval(() => this.makePlan(), 250);
        this.subscribe(Messages.PLAYER_COLLIDED);
    }

    onMessage(msg: Message): any {
        super.onMessage(msg);

        if (msg.action == Messages.PLAYER_COLLIDED) {
            let payload = msg.data as CollisionMessage;
            let {player} = payload;
            if (player == this.owner) {
                console.log("BOT COLLISION");

                if (this.plan == PlanType.PLANT) {
                    let myPosInt = this.positionToCoords(this.owner.position);
                    let cellToPlaceInt = this.positionToCoords(this.planCoords);
                    if (myPosInt.x == cellToPlaceInt.x && myPosInt.y == cellToPlaceInt.y) {
                        this.placeBomb();
                    }
                }

                this.plan = null;
            }
        }
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        if (this.plan == null) {
            return
        }

        if (this.isPlanFinished()) {
            if (this.plan == PlanType.PLANT) {
                console.log("placing bomb", this.bombsPlacedCount, this.maxBombCount);
                this.placeBomb();
            }
            this.plan = null;
        } else {
            this.botMoveTo(delta, this.planCoords);
        }
    }

    makePlan() {
        console.log("MAKE PLAN", this.owner.name);

        if (this.bombsAroundPlan()) return;
        if (this.boxesAroundPlan()) return;
        if (this.endGamePlan()) return;
    }

    isPlanFinished(): boolean {
        let myCoords = this.positionToCoords(this.owner.position);

        if (this.plan == PlanType.MOVE) {
            let planCoords = this.positionToCoords(this.planCoords);

            if (myCoords.x == planCoords.x && myCoords.y == planCoords.y) {
                console.warn("FINISH PLAN?", planCoords, this.owner.position);
                if (planCoords.x + Config.PIXEL_EDGE > this.owner.position.x && planCoords.y + Config.PIXEL_EDGE > this.owner.position.y) {
                    console.warn("FINISH MOVE");
                    return true;
                } else {
                    console.log("NOT YET FULLY THERE");
                }
            }
        } else if (this.plan == PlanType.PLANT) {
            let planCoords = this.positionToCoords(this.planCoords);

            if (myCoords.x == planCoords.x) {
                if (myCoords.y - 1 == planCoords.y || myCoords.y + 1 == planCoords.y) {
                    return true;
                }
            }

            if (myCoords.y == planCoords.y) {
                if (myCoords.x - 1 == planCoords.x || myCoords.x + 1 == planCoords.x) {
                    return true;
                }
            }
        }

        return false;
    }

    // Run from bombs.
    bombsAroundPlan(): boolean {
        let bombs = this.scene.findObjectsByTag(Tags.BOMB);

        let dangerFlag = false;
        for (let bomb of bombs) {
            if (this.isStraightPathBetween(this.positionToCoords(this.owner.position), bomb.position)) {
                dangerFlag = true;
                break;
            }
        }

        if (dangerFlag) {
            let safeCell = this.closestSafeCell();
            console.log(safeCell.position);
            this.plan = PlanType.MOVE;
            this.planCoords = safeCell.position;
            console.log("== bombsAroundPlan");
            return true;
        }

        return false;
    }

    // Destroy boxes.
    boxesAroundPlan(): boolean {
        let boxes = this.scene.findObjectsByTag(Tags.BREAKABLE_WALL);
        let myCoords = this.owner.position;

        if (boxes.length > 0) {
            let closestBox = this.closestCell(boxes);

            this.plan = PlanType.PLANT;

            if (this.positionToCoords(myCoords).x != this.positionToCoords(closestBox).x) {
                this.planCoords = {x: myCoords.x - myCoords.x + closestBox.x, y: myCoords.y};
            } else {
                this.planCoords = {x: myCoords.x, y: myCoords.y - myCoords.y + closestBox.y};
            }

            console.log("== boxesAroundPlan", this.owner.position, this.planCoords);
            return true;
        }

        return false;
    }

    // Do troubles.
    endGamePlan(): boolean {
        return false;
    }

    botMoveTo(delta: number, coords: Coords) {
        console.log("=> Moving from ", this.owner.position, " to ", coords);

        let myCoords = this.owner.position;
        let myCoordsInt = this.positionToCoords(this.owner.position);
        let coordsInt = this.positionToCoords(coords) ;
        if (this.isStraightPathBetween(myCoords, coords)) {
            // On the cell with X, center the player.
            if (myCoordsInt.x == coordsInt.x) {
                if (myCoords.x < coordsInt.x + Config.PIXEL_EDGE) {
                    this.moveRight(delta);
                    console.log("RIGHT 1");
                } else if (myCoords.x > coordsInt.x + Config.PIXEL_EDGE + Config.PIXEL_EDGE) {
                    this.moveLeft(delta);
                    console.log("LEFT 1");
                }
            }
            // Not yet on the cell with X.
            else {
                if (myCoordsInt.x < coordsInt.x) {
                    this.moveRight(delta);
                    console.log("RIGHT 2");
                } else {
                    this.moveLeft(delta);
                    console.log("LEFT 2");
                }
            }

            // On the cell with Y, center the player.
            if (myCoordsInt.y == coordsInt.y) {
                if (myCoords.y < coordsInt.y + Config.PIXEL_EDGE) {
                    this.moveDown(delta);
                    console.log("DOWN 1");
                } else if (myCoords.y > coordsInt.y + Config.PIXEL_EDGE + Config.PIXEL_EDGE) {
                    this.moveUp(delta);
                    console.log("UP 1");
                }
            }
            // Not yet on the cell with Y.
            else {
                if (myCoordsInt.y < coordsInt.y) {
                    this.moveDown(delta);
                    console.log("DOWN 2");
                } else {
                    this.moveUp(delta);
                    console.log("UP 2");
                }
            }
            console.log("- finished move");
        } else {
            console.log("ELSE");
            let cellSteps = this.cellStepsToCoord(coords);
            if (cellSteps != null) {
                console.log("... ... moving to crossover", cellSteps);
                this.plan = PlanType.MOVE;
                this.planCoords = cellSteps;
            } else {
                console.error("!! SHIT, gonna die :(");
            }
        }
    }

    // ---

    cellStepsToCoord(coord: Coords): Coords {
        console.log("---");
        console.log("---");
        let emptyCells = this.scene.findObjectsByTag(Tags.EMPTY);
        let bombs = this.scene.findObjectsByTag(Tags.BOMB);

        // init map
        let n = Config.SCENE_WIDTH;
        let safeCells: number[][] = new Array(n)
            .fill(-1)
            .map(() => new Array(n)
                .fill(-1));

        // construct map
        for (let cell of emptyCells) {
            safeCells[cell.y][cell.x] = 0;
        }

        // BFS
        let myCoords = this.positionToCoords(this.owner.position);
        let targetCoords = this.positionToCoords(coord);

        let queue: Queue<QueueBFS> = new Queue<QueueBFS>();
        queue.push({coords: targetCoords, from: -2});
        while (queue.length() > 0) {
            let current = queue.pop();

            if (current.coords.y < 0 || current.coords.x < 0 || current.coords.y >= Config.SCENE_WIDTH || current.coords.x >= Config.SCENE_WIDTH) {
                // console.log("A");
                continue;
            }

            if (safeCells[current.coords.y][current.coords.x] != 0) {
                // console.log("B");
                continue;
            }

            safeCells[current.coords.y][current.coords.x] = current.from;
            // 1 - top, 2 - right, 3 - down, 4 - left
            queue.push({coords: {x: current.coords.x, y: current.coords.y + 1}, from: 1});
            queue.push({coords: {x: current.coords.x - 1, y: current.coords.y}, from: 2});
            queue.push({coords: {x: current.coords.x, y: current.coords.y - 1}, from: 3});
            queue.push({coords: {x: current.coords.x + 1, y: current.coords.y}, from: 4});
        }

        let targetNextCell = safeCells[myCoords.y][myCoords.x];
        if (targetNextCell > 0) {
            if (targetNextCell == 1) {
                return {x: myCoords.x, y: myCoords.y - 1};
            } else if (targetNextCell == 2 ) {
                return {x: myCoords.x + 1, y: myCoords.y};
            } else if (targetNextCell == 3 ) {
                return {x: myCoords.x, y: myCoords.y + 1};
            } else if (targetNextCell == 4 ) {
                return {x: myCoords.x - 1, y: myCoords.y};
            }
        }

        return null;
    }

    closestSafeCell(): ECS.Container {
        let emptyCells = this.scene.findObjectsByTag(Tags.EMPTY);
        let bombs = this.scene.findObjectsByTag(Tags.BOMB);

        let safeCells: ECS.Container[] = [];
        for (let cell of emptyCells) {
            for (let bomb of bombs) {
                if (cell.x != bomb.x && cell.y != bomb.y && !this.isStraightPathBetween(cell.position, bomb.position)) {
                    safeCells.push(cell);
                }
            }
        }

        let closesSafeCell = this.closestCell(safeCells);

        console.log("ON ", this.positionToCoords(this.owner.position));
        console.log("CLOSEST SAFE ", this.positionToCoords(closesSafeCell));

        return closesSafeCell;
    }

    closestCell(cells: ECS.Container[]): ECS.Container {
        let myCoords = this.owner.position;

        let closestBox = cells[0];
        let closestXPath = Math.abs(closestBox.position.x - myCoords.x);
        let closestYPath = Math.abs(closestBox.position.y - myCoords.y);
        for (let cell of cells) {
            let xPath = Math.abs(cell.position.x - myCoords.x);
            let yPath = Math.abs(cell.position.y - myCoords.y)
            if (xPath + yPath < closestXPath + closestYPath) {
                closestBox = cell;
                closestXPath = xPath;
                closestYPath = yPath;
            }
        }

        return closestBox;
    }

    positionToCoords(position: Coords) {
        return {x: Math.floor(position.x), y: Math.floor(position.y)}
    }

    isStraightPathBetween(_firstCoord: Coords, _secondCoord: Coords): boolean {
        let firstCoord = this.positionToCoords(_firstCoord);
        let secondCoord = this.positionToCoords(_secondCoord);

        // The bot is not in line with the bomb.
        if (firstCoord.x != secondCoord.x && firstCoord.y != secondCoord.y) {
            return false;
        }

        // Exact position.
        if (firstCoord.x == secondCoord.x && firstCoord.y == secondCoord.y) {
            return true;
        }

        // Is in line, check if there is clear path.
        let empties = this.scene.findObjectsByTag(Tags.EMPTY);

        // shares x
        if (firstCoord.x == secondCoord.x) {
            let minY = Math.min(firstCoord.y, secondCoord.y);
            let maxY = Math.max(firstCoord.y, secondCoord.y);
            let emptiesYOnLine: number[] = [];

            for (let cell of empties) {
                if (cell.x == secondCoord.x && cell.y > minY && cell.y < maxY) {
                    emptiesYOnLine.push(cell.y);
                }
            }

            emptiesYOnLine = emptiesYOnLine.sort((a: number, b: number) => a - b);

            let flag = true;
            for (let i = 0; i < emptiesYOnLine.length; i++) {
                if (emptiesYOnLine[i] != minY + 1 + i) {
                    flag = false;
                    break;
                }
            }
            if (flag) return true;
        }
        // shares y
        else if (firstCoord.y == secondCoord.y) {
            let minX = Math.min(firstCoord.x, secondCoord.x);
            let maxX = Math.max(firstCoord.x, secondCoord.x);
            let emptiesXOnLine: number[] = [];

            for (let cell of empties) {
                if (cell.y == secondCoord.y && cell.x > minX && cell.x < maxX) {
                    emptiesXOnLine.push(cell.x);
                }
            }

            emptiesXOnLine = emptiesXOnLine.sort((a: number, b: number) => a - b);

            let flag = true;
            for (let i = 0; i < emptiesXOnLine.length; i++) {
                if (emptiesXOnLine[i] != minX + 1 + i) {
                    flag = false;
                    break;
                }
            }
            if (flag) return true;
        }

        return false;
    }

    onDetach() {
        super.onDetach();
        clearInterval(this.planInterval);
    }
}

export {
    PlayerBotController,
}
