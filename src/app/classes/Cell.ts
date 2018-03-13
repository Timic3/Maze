import { AppConstants } from '../app.constants';

import { Easing } from './Utilities';

export enum Walls {
  NORTH = 0,
  EAST = 1,
  SOUTH = 2,
  WEST = 3
}

export class Cell {
  public static list: Cell[][];

  public x: number;
  public y: number;
  public color: number[];
  public visited: boolean;

  protected walls: Boolean[];

  public padX: number;
  public padY: number;
  public padWidth: number;
  public padHeight: number;

  protected animationStep = 0;
  protected pulsateStep = 0;

  public image;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.color = [255, 255, 255, 0];
    this.visited = false;
    this.walls = [true, true, true, true];

    this.padX = this.x * AppConstants.PADS_WIDTH + AppConstants.SPACING;
    this.padY = this.y * AppConstants.PADS_HEIGHT + AppConstants.SPACING;
    this.padWidth = AppConstants.PADS_WIDTH - AppConstants.SPACING * 2;
    this.padHeight = AppConstants.PADS_HEIGHT - AppConstants.SPACING * 2;

    this.image = new Image();
    this.image.src = 'assets/images/star.png';
  }

  // Solve with backtracking algorithm
  public static solve(startCell, endCell) {
    for (let x = 0; x < AppConstants.PADS_X; x++) {
      for (let y = 0; y < AppConstants.PADS_Y; y++) {
        Cell.list[x][y].visited = false;
      }
    }

    const solution: Cell[] = [];
    let currentCell = startCell;
    let options = [];

    while ((currentCell.x !== endCell.x) || (currentCell.y !== endCell.y)) {
      currentCell.visited = true;
      options = currentCell.options(true);

      if (options.length === 0) {
        // Backtrack
        currentCell = solution.pop();
      } else {
        // Continue
        solution.push(currentCell);
        currentCell = options[0];
      }
    }

    solution.push(currentCell);

    return solution;
  }

  options(walls) {
    const options = [];

    const checkOption = (x, y) => {
      if (walls) {
        if ((y < this.y && this.walls[Walls.NORTH]) ||
            (x > this.x && this.walls[Walls.EAST]) ||
            (y > this.y && this.walls[Walls.SOUTH]) ||
            (x < this.x && this.walls[Walls.WEST])) {
              return;
            }
      }
      if (Cell.list[x] && Cell.list[x][y] && !Cell.list[x][y].visited) {
        options.push(Cell.list[x][y]);
      }
    };

    checkOption(this.x, this.y - 1);
    checkOption(this.x + 1, this.y);
    checkOption(this.x, this.y + 1);
    checkOption(this.x - 1, this.y);

    return options;
  }

  visit(direction) {
    this.visited = true;
    if (typeof direction === 'number') {
      this.walls[direction] = false;
    }

    let options = this.options(false);

    while (options.length > 0) {
      const index = Math.floor(Math.random() * options.length);
      const nextCell = options[index];

      if (this.y > nextCell.y) {
        this.walls[Walls.NORTH] = false;
        nextCell.visit(Walls.SOUTH);
      } else if (this.x < nextCell.x) {
        this.walls[Walls.EAST] = false;
        nextCell.visit(Walls.WEST);
      } else if (this.y < nextCell.y) {
        this.walls[Walls.SOUTH] = false;
        nextCell.visit(Walls.NORTH);
      } else if (this.x > nextCell.x) {
        this.walls[Walls.WEST] = false;
        nextCell.visit(Walls.EAST);
      }

      options = this.options(false);
    }
  }

  hasWall(direction: Walls) {
    return this.walls[direction];
  }

  draw(context: CanvasRenderingContext2D, didStarHit: boolean) {
    context.save();
    context.beginPath();
    // context.fillStyle = 'rgba(' + this.color[0] + ', ' + this.color[1] + ', ' + this.color[2] + ', ' + this.color[3] + ')';
    // context.fillRect(this.padX, this.padY, this.padWidth, this.padHeight);

    if (this.x === AppConstants.PADS_X - 1 && this.y === AppConstants.PADS_Y - 1) {
      this.pulsateStep += 0.01;
      if (this.pulsateStep >= 1) {
        this.pulsateStep = 0;
      }
      const pulsateAnimation = Easing.easeOutCubic(this.pulsateStep);
      context.strokeStyle = 'rgba(255, 255, 255, ' + (1 - this.pulsateStep) + ')';
      context.lineWidth = 2.5;
      context.beginPath();
      context.arc(this.padX + (this.padWidth / 2), this.padY + (this.padHeight / 2), 70 * pulsateAnimation, 0, Math.PI * 2);
      context.closePath();
      context.stroke();
    }

    context.fillStyle = 'orange';
    if (didStarHit) {
      this.animationStep += 0.06;
      if (this.animationStep >= 1) {
        this.animationStep = 1;
      }
    } else {
      this.animationStep -= 0.06;
      if (this.animationStep <= 0) {
        this.animationStep = 0;
      }
    }

    if (this.animationStep !== 0) {
      const easeAnimation = Easing.easeOutCubic(this.animationStep);
      const starX = this.padX + (this.padWidth / 2) * (1 - easeAnimation),
            starY = this.padY + (this.padHeight / 2) * (1 - easeAnimation);
      if (this.image.complete) {
        context.drawImage(this.image, starX, starY, this.padWidth * easeAnimation, this.padHeight * easeAnimation);
      } else {
        context.fillRect(starX, starY, this.padWidth * easeAnimation, this.padHeight * easeAnimation);
      }
    }

    // Walls
    context.fillStyle = 'rgb(78, 48, 132)';

    const wallXOnY = this.padX - AppConstants.SPACING * 2;
    const wallWidthOnY = this.padWidth + AppConstants.SPACING * 4;
    const wallYOnX = this.padY - AppConstants.SPACING * 2;
    const wallHeightOnX = this.padHeight + AppConstants.SPACING * 4;
    if (this.walls[Walls.NORTH]) {
      context.fillRect(wallXOnY, this.padY - AppConstants.SPACING, wallWidthOnY, AppConstants.SPACING);
    }
    if (this.walls[Walls.EAST]) {
      context.fillRect(this.padX + this.padWidth, wallYOnX, AppConstants.SPACING, wallHeightOnX);
    }
    if (this.walls[Walls.SOUTH]) {
      context.fillRect(wallXOnY, this.padY + this.padHeight, wallWidthOnY, AppConstants.SPACING);
    }
    if (this.walls[Walls.WEST]) {
      context.fillRect(this.padX - AppConstants.SPACING, wallYOnX, AppConstants.SPACING, wallHeightOnX);
    }

    context.restore();
  }
}
