export class GameRow {
    constructor(leftSideWidth, roadWith, trap, gold, sideColor) {
        this.leftSide = leftSideWidth;
        this.road = roadWith;
        this.rightSide = 1 - roadWith - leftSideWidth;
        this.trap = trap;
        this.gold = gold;
        this.sideColor = sideColor;
    }
}