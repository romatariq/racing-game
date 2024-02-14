import { GameRow } from "./GameRow.js";

export class Game {
    constructor() {
        this.map = [];

        this.isPaused = true;
        this.isOver = false;

        this.roadSide = "white";
        

        this.ROAD_WIDTH = 0.4;
        this.ROW_COUNT = 10;
        this.STEP_WIDTH = 0.005;
        this.TRAP_ODDS = 0.05;
        this.TRAP_SIZE = 0.15;
        this.INCREASE_TRAP_ODDS_BY = 0.025;

        this.GOLD_ODDS = 0.1;
        this.GOLD_SIZE = 0.1;

        this.trapCount = 0;
        this.leftSide = 0.3;
        this.rowsWithoutTrap = -10;
        this.directionIsLeft = this.getIsLeftDirection(); 
        this.directionSteps = this.getDirectionSteps();


        this.score = 0;
    
        this.generateMap();
  }

    generateMap() {
        while (this.map.length < this.ROW_COUNT) {
            this.generateRow();
        }
    }

    generateRow() {

        let trap = false;
        let gold = false;

        if (this.directionIsLeft) {
            this.leftSide = this.leftSide - this.STEP_WIDTH;
        } else {
            this.leftSide = this.leftSide + this.STEP_WIDTH;
        }
        this.directionSteps--;

        if (this.directionSteps === 0) {
            this.directionIsLeft = this.getIsLeftDirection();
            this.directionSteps = this.getDirectionSteps();
        }
        if (this.leftSide <= 0.1) {
            this.directionIsLeft = false;
        } if (this.leftSide >= 0.9 - this.ROAD_WIDTH) {
          this.directionIsLeft = true;
        }

        this.rowsWithoutTrap++;
        if (this.rowsWithoutTrap > 10 && this.getOdds(this.TRAP_ODDS)) {
            trap = true;
            this.trapCount++;
            this.rowsWithoutTrap = 0;

            if (this.trapCount > 0 && this.trapCount % 3 === 0) {
                this.TRAP_ODDS += this.INCREASE_TRAP_ODDS_BY;
            }
        } else if (this.getOdds(this.GOLD_ODDS)) {
            gold = true;
        }

        this.sideColor = this.sideColor === "white" ? "red" : "white";
      

        this.map.push(new GameRow(this.leftSide, this.ROAD_WIDTH, trap, gold, this.sideColor));
    }
    
    getIsLeftDirection() {
        return Math.random() < 0.5;
    }

    getDirectionSteps() {
        return Math.floor(Math.random() * 15) + 1;
    }

    getOdds(odds) {
        return Math.random() < odds;
    }
}
