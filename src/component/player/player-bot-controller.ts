import {PlayerController} from "./player-controller";
import {Coords} from "../../utils";
import {Messages, Tags} from "../../constants";
import * as ECS from "../../../libs/pixi-ecs";
import {Message} from "../../../libs/pixi-ecs";
import {CollisionMessage} from "../stage/player-collision-watcher";

enum PlanType {
    MOVE,
    PLANT,
}

class PlayerBotController extends PlayerController {
    private planInterval: number;

    private keyInputCmp: ECS.KeyInputComponent;

    private plan: PlanType;
    private planCoords: Coords;

    constructor(player: number = 0) {
        super(player);
    }

    onInit() {
        super.onInit();
        this.planInterval = setInterval(() => this.makePlan(), 1000);
        this.keyInputCmp = this.scene.findGlobalComponentByName<ECS.KeyInputComponent>(ECS.KeyInputComponent.name); // TODO
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
                    this.placeBomb();
                }

                this.plan = null;
            }
        }
    }

    onUpdate(delta: number, absolute: number) {
        super.onUpdate(delta, absolute);

        // TODO: remove
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_K)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_K);
            this.plan = PlanType.MOVE;
            this.planCoords = {x: this.owner.position.x, y: this.owner.position.y + 1}
        }

        // TODO: remove
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_I)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_I);
            this.plan = PlanType.MOVE;
            this.planCoords = {x: this.owner.position.x, y: this.owner.position.y - 1}
        }

        // TODO: remove
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_L)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_L);
            this.plan = PlanType.MOVE;
            this.planCoords = {x: this.owner.position.x + 1, y: this.owner.position.y}
        }

        // TODO: remove
        if (this.keyInputCmp.isKeyPressed(ECS.Keys.KEY_J)) {
            this.keyInputCmp.handleKey(ECS.Keys.KEY_J);
            this.plan = PlanType.MOVE;
            this.planCoords = {x: this.owner.position.x - 1, y: this.owner.position.y}
        }

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

        // // MOVING PLAN
        // else if (this.plan == PlanType.MOVE) {
        //     if (this.isPlanFinished()) {
        //         this.plan = null;
        //     } else {
        //         this.botMoveTo(delta, this.planCoords);
        //     }
        // }
        // // PLANT PLAN
        // else if (this.plan == PlanType.PLANT) {
        //     // this.placeBomb();
        // }

        // let targetCoords = {x: this.owner.position.x, y: this.owner.position.y + 1};
        // this.botMoveTo(50, targetCoords);
    }

    makePlan() {
        console.log("MAKE PLAN", this.owner.name);

        if (this.bombsAroundPlan()) return;
        if (this.boxesAroundPlan()) return;
        // if (this.playersAroundPlan()) return;
    }

    isPlanFinished(): boolean {
        let myCoords = this.positionToCoords(this.owner.position);

        if (this.plan == PlanType.MOVE) {
            let planCoords = this.positionToCoords(this.planCoords);

            if (myCoords.x == planCoords.x && myCoords.y == planCoords.y) {
                console.log("MOVE PLAN FINISHED");
                return true;
            }
        } if (this.plan == PlanType.PLANT) {
            let planCoords = this.positionToCoords(this.planCoords);

            if (myCoords.x == planCoords.x) {
                if (myCoords.y - 1 == planCoords.y || myCoords.y + 1 == planCoords.y) {
                    console.log("PLANT PLAN FINISHED 1");
                    return true;
                }
            }

            if (myCoords.y == planCoords.y) {
                if (myCoords.x - 1 == planCoords.x || myCoords.x + 1 == planCoords.x) {
                    console.log("PLANT PLAN FINISHED 2");
                    return true;
                }
            }
        }

        return false;
    }

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
            // TODO: run
            // TODO: find safe empty cell
            let safeCell = this.closestSafeCell();
            console.log("!!!!!!!!!!!!");
            console.log("!!!!!!!!!!!!");
            console.log(safeCell.position);
            this.plan = PlanType.MOVE;
            this.planCoords = safeCell.position;
            console.log("== bombsAroundPlan");
            return true;
        }

        return false;
    }

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

    playersAroundPlan(): boolean {
        return false;
    }

    botMoveTo(delta: number, rawCoords: Coords) {
        // console.log("=> Moving from ", this.owner.position, " to ", rawCoords);

        let myCoords = this.positionToCoords(this.owner.position);
        let coords = this.positionToCoords(rawCoords);
        if (this.isStraightPathBetween(myCoords, coords)) {
            if (myCoords.x < coords.x) {
                this.moveRight(delta);
            }
            if (myCoords.x > coords.x) {
                this.moveLeft(delta);
            }
            if (myCoords.y < coords.y) {
                this.moveDown(delta);
            }
            if (myCoords.y > coords.y) {
                this.moveUp(delta);
            }
        } else {
            // ?
            console.log("SHIT");
        }
    }

    // ---

    cellStepsToCell(targetCell: ECS.Container): ECS.Container[] {

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
        return {x: Math.floor(position.x + 1), y: Math.floor(position.y)}
    }

    isStraightPathBetween(firstCoord: Coords, secondCoord: Coords): boolean {
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
