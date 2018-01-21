import { Component, AfterContentInit, HostListener } from '@angular/core';
// import { MatDialog } from '@angular/material';

import { AppConstants } from './app.constants';
import { Cell, Walls } from './classes/Cell';

// Find another way to link it with NPM
declare var GlslCanvas: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentInit {
  public glslSandbox: any;
  public animationsEnabled = true;
  public animationText = 'Disable fancy animations';

  public game: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public mouseDown = false;
  public solution;

  public star: number[] = [];
  public starredPad: Cell;

  ngAfterContentInit() {
    // Construct GLSL sandbox
    const galaxy = document.getElementById('galaxyBackground');
    this.glslSandbox = new GlslCanvas(galaxy);

    const animationState = localStorage.getItem('animationState');
    if (animationState == null) {
      localStorage.setItem('animationState', JSON.stringify(false));
    } else {
      this.animationsEnabled = JSON.parse(animationState);
      if (this.animationsEnabled) {
        this.animationText = 'Disable fancy animations';
        this.glslSandbox.play();
      } else {
        this.animationText = 'Enable fancy animations';
        this.glslSandbox.pause();
      }
    }
    // Update canvas based on window size
    galaxy.setAttribute('width', String(window.innerWidth));
    galaxy.setAttribute('height', String(window.innerHeight));
    // Update GL viewport to fit the canvas
    this.glslSandbox.gl.viewport(0, 0, this.glslSandbox.gl.canvas.width, this.glslSandbox.canvas.height);

    // Game
    this.game = <HTMLCanvasElement>document.getElementById('game');
    this.context = this.game.getContext('2d');
    this.game.setAttribute('width', String(AppConstants.GAME_WIDTH));
    this.game.setAttribute('height', String(AppConstants.GAME_HEIGHT));

    this.star = [0, 0];

    // Generate
    this.generateMaze();

    // Start rendering
    this.gameLoop();
  }

  // Retain scope (this) using Lambda expression.
  gameLoop = () => {
    requestAnimationFrame(this.gameLoop);
    this.context.clearRect(0, 0, AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.context.fillRect(0, 0, AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);
    for (let x = 0; x < AppConstants.PADS_X; x++) {
      for (let y = 0; y < AppConstants.PADS_Y; y++) {
        const currentCell = Cell.list[x][y];
        currentCell.draw(this.context, currentCell === this.starredPad);
      }
    }

    if (this.solution) {
      this.context.fillStyle = 'red';
      for (let i = 0; i < this.solution.length; i++) {
        const cell = this.solution[i];
        this.context.fillRect(cell.padX, cell.padY, cell.padWidth, cell.padHeight);
      }
    }

    /*if (this.star.length === 2) {
      this.context.fillStyle = 'red';
      const cursorX = this.star[0];
      const cursorY = this.star[1];
      const cell = Cell.list[cursorX][cursorY];
      this.context.fillRect(cell.padX, cell.padY, cell.padWidth, cell.padHeight);
    }*/
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const canvasBounds = this.game.getBoundingClientRect(),
          mouseX = event.clientX - canvasBounds.left,
          mouseY = event.clientY - canvasBounds.top;

    // Complex collision checking
    // Check if mouse is actually within canvas
    if (mouseX >= 0 && mouseX < AppConstants.GAME_WIDTH &&
        mouseY >= 0 && mouseY < AppConstants.GAME_HEIGHT) {
          // Save the cursor position (might remove this?)
          const cursor = [Math.floor(mouseX / AppConstants.PADS_WIDTH), Math.floor(mouseY / AppConstants.PADS_HEIGHT)];
          // Get cursor difference between the cursor (your mouse) and the star (current pad position)
          // Difference allows us to:
          // 1. Limit the maximum radius around the star to 1 pad
          // This prevents user to cheat by right-clicking and moving to another position
          // 2. Check if the cursor is around the star, but not diagonally!
          const cursorDiffX = Math.abs(cursor[0] - this.star[0]),
                cursorDiffY = Math.abs(cursor[1] - this.star[1]);
          if ((cursorDiffX === 1 && cursorDiffY === 0) ||
              (cursorDiffX === 0 && cursorDiffY === 1)) {
                // Wall check
                const starCell = Cell.list[this.star[0]][this.star[1]],
                      checkCell = Cell.list[cursor[0]][cursor[1]];
                let direction = Walls.NORTH;
                if (starCell.y > checkCell.y) {
                  // Going north!
                  direction = Walls.NORTH;
                } else if (starCell.x < checkCell.x) {
                  // Going east!
                  direction = Walls.EAST;
                } else if (starCell.y < checkCell.y) {
                  // Going south!
                  direction = Walls.SOUTH;
                } else if (starCell.x > checkCell.x) {
                  // Going west!
                  direction = Walls.WEST;
                }

                // Check if star cell has a wall, and if not, move the star
                if (!starCell.hasWall(direction)) {
                  this.star = [checkCell.x, checkCell.y];
                  this.starredPad = checkCell;
                }
          }
    }
  }

  /*@HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.mouseDown = true;
    // this.star.color = 'blue';
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.mouseDown = false;
    // this.star.color = 'red';
  }*/

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    const galaxy = document.getElementById('galaxyBackground');
    galaxy.setAttribute('width', String(event.target.innerWidth));
    galaxy.setAttribute('height', String(event.target.innerHeight));
    // Update GL viewport to fit the canvas
    this.glslSandbox.gl.viewport(0, 0, this.glslSandbox.gl.canvas.width, this.glslSandbox.canvas.height);
  }

  toggleAnimations() {
    this.animationsEnabled = !this.animationsEnabled;
    localStorage.setItem('animationState', JSON.stringify(this.animationsEnabled));
    if (this.animationsEnabled) {
      this.animationText = 'Disable fancy animations';
      this.glslSandbox.play();
    } else {
      this.animationText = 'Enable fancy animations';
      this.glslSandbox.pause();
    }
  }

  generateMaze() {
    Cell.list = [];
    for (let x = 0; x < AppConstants.PADS_X; x++) {
      Cell.list[x] = [];
      for (let y = 0; y < AppConstants.PADS_Y; y++) {
        Cell.list[x][y] = new Cell(x, y);
        if (x === 0 && y === 0) {
          this.starredPad = Cell.list[x][y];
          Cell.list[x][y].color = [150, 150, 150];
        } else if (x === AppConstants.PADS_X - 1 && y === AppConstants.PADS_Y - 1) {
          Cell.list[x][y].color = [150, 150, 150];
        }
      }
    }

    // Perform randomized depth-first search algorithm
    // 1. Every cell must have all walls
    // 2. Choose a random cell
    // 3. From this cell, choose a random neighbor cell that wasn't visited before
    // and delete walls between the current and previous cell
    // 4. If there are no unvisited neighbors, backtrack to previous cell and repeat,
    // otherwise continue

    const startX = Math.floor(Math.random() * AppConstants.PADS_X);
    const startY = Math.floor(Math.random() * AppConstants.PADS_Y);
    Cell.list[startX][startY].visit(false);
  }

  openDialog() {
    // let dialogRef = this.dialog.open();
  }

  solveMaze() {
    this.solution = Cell.solve(Cell.list[0][0], Cell.list[AppConstants.PADS_X - 1][AppConstants.PADS_Y - 1]);
    this.solution.pop();
    this.solution.shift();
  }

  resetMaze() {
    this.solution = [];
    Cell.list = [];
    this.star = [0, 0];
    this.generateMaze();
  }
}
