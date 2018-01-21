import { Component, AfterContentInit, HostListener } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';

import { SettingsComponent } from './components/app.settings.component';

import { AppConstants } from './app.constants';
import { Cell, Walls } from './classes/Cell';
import { Gradient } from './classes/Gradient';
import { Easing } from './classes/Utilities';

// Find another way to link it with NPM
declare var GlslCanvas: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentInit {
  public glslSandbox: any;

  public game: HTMLCanvasElement;
  public galaxyAudio;
  public starAudio;
  public playStarAudio = true;
  public context: CanvasRenderingContext2D;
  public solution;

  public gradient: Gradient;

  public star: number[] = [];
  public starredPad: Cell;
  public mazeSolved = false;
  public fadeOut = false;
  public fadeStep = 0;

  public settings: Map<String, any> = new Map<String, any>();

  constructor(public dialog: MatDialog, public snackBar: MatSnackBar) { }

  ngAfterContentInit() {
    // Construct GLSL sandbox
    const galaxy = document.getElementById('galaxyBackground');
    this.glslSandbox = new GlslCanvas(galaxy);

    this.galaxyAudio = new Audio();
    this.galaxyAudio.src = './assets/sounds/background.mp3';
    this.galaxyAudio.load();

    this.starAudio = new Audio();
    this.starAudio.src = './assets/sounds/woosh.mp3';
    this.starAudio.load();

    if (typeof this.galaxyAudio.loop === 'boolean') {
      this.galaxyAudio.loop = true;
    } else {
      this.galaxyAudio.addEventListener('ended', () => {
        this.galaxyAudio.currentTime = 0;
        this.galaxyAudio.play();
      }, false);
    }

    // Set up gradient background
    this.gradient = new Gradient(AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);
    this.gradient.addStop(0, [
      [9, 117, 190],
      [59, 160, 89],
      [230, 192, 39],
      [238, 30, 77]
    ]);
    this.gradient.addStop(1, [
      [205, 24, 75],
      [33, 98, 155],
      [64, 149, 69],
      [228, 171, 33]
    ]);

    const settingsExist = localStorage.getItem('settings');
    if (settingsExist == null) {
      this.settings.set('galaxyAnimation', true);
      this.settings.set('galaxyAudio', true);
      this.settings.set('starAudio', true);
      localStorage.setItem('settings', JSON.stringify(Array.from(this.settings.entries())));
    } else {
      const settings = new Map(JSON.parse(settingsExist));
      const galaxyAnimation = settings.get('galaxyAnimation');
      const galaxyAudio = settings.get('galaxyAudio');
      const starAudio = settings.get('starAudio');
      this.adjustSettings(galaxyAnimation, galaxyAudio, starAudio);
      this.settings.set('galaxyAnimation', galaxyAnimation);
      this.settings.set('galaxyAudio', galaxyAudio);
      this.settings.set('starAudio', starAudio);
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

    setTimeout(() => {
      this.snackBar.open('Move your 🐁 to the 📙 pad and move it towards any unblocked path. Reach the 📗 pad to win.', 'Okay');
    }, 1000);

    // Generate
    this.generateMaze();

    // Start rendering
    this.gameLoop();
  }

  // Retain scope (this) using Lambda expression.
  gameLoop = () => {
    requestAnimationFrame(this.gameLoop);
    this.context.clearRect(0, 0, AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);
    this.gradient.updateStops();
    const gradientStyle = this.gradient.getGradient(this.context);
    this.context.fillStyle = gradientStyle;
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

    if (this.fadeOut) {
      this.fadeStep -= 0.01;
      if (this.fadeStep <= 0) {
        this.fadeStep = 0;
      }
      const easeAnimation = Easing.easeInOutCubic(this.fadeStep);
      this.game.style.width = String(easeAnimation * AppConstants.GAME_WIDTH) + 'px';
      this.game.style.height = String(easeAnimation * AppConstants.GAME_HEIGHT) + 'px';
    } else {
      this.fadeStep += 0.01;
      if (this.fadeStep >= 1) {
        this.fadeStep = 1;
      }
      const easeAnimation = Easing.easeInOutCubic(this.fadeStep);
      this.game.style.width = String(easeAnimation * AppConstants.GAME_WIDTH) + 'px';
      this.game.style.height = String(easeAnimation * AppConstants.GAME_HEIGHT) + 'px';
    }
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const canvasBounds = this.game.getBoundingClientRect(),
          mouseX = event.clientX - canvasBounds.left,
          mouseY = event.clientY - canvasBounds.top;

    // Complex collision checking
    // Check if mouse is actually within canvas
    if (!this.mazeSolved &&
        mouseX >= 0 && mouseX < AppConstants.GAME_WIDTH &&
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
                  if (this.playStarAudio) {
                    this.starAudio.currentTime = 0;
                    this.starAudio.play();
                  }

                  if (checkCell.x === AppConstants.PADS_X - 1 && checkCell.y === AppConstants.PADS_Y - 1) {
                    // Reached the end
                    this.mazeSolved = true;
                    this.fadeOut = true;
                  }
                }
          }
    }
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    const galaxy = document.getElementById('galaxyBackground');
    galaxy.setAttribute('width', String(event.target.innerWidth));
    galaxy.setAttribute('height', String(event.target.innerHeight));
    // Update GL viewport to fit the canvas
    this.glslSandbox.gl.viewport(0, 0, this.glslSandbox.gl.canvas.width, this.glslSandbox.canvas.height);
  }

  generateMaze() {
    Cell.list = [];
    for (let x = 0; x < AppConstants.PADS_X; x++) {
      Cell.list[x] = [];
      for (let y = 0; y < AppConstants.PADS_Y; y++) {
        Cell.list[x][y] = new Cell(x, y);
        if (x === 0 && y === 0) {
          this.starredPad = Cell.list[x][y];
          Cell.list[x][y].color = [255, 255, 255, 255];
        } else if (x === AppConstants.PADS_X - 1 && y === AppConstants.PADS_Y - 1) {
          Cell.list[x][y].color = [0, 255, 0, 255];
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

  openSettings() {
    const dialog = this.dialog.open(SettingsComponent, {
      width: '350px',
      data: {
        galaxyAnimation: this.settings.get('galaxyAnimation'),
        galaxyAudio: this.settings.get('galaxyAudio'),
        starAudio: this.settings.get('starAudio')
      }
    });

    dialog.afterClosed()
      .subscribe((settings) => {
        if (settings) {
          this.adjustSettings(settings[0], settings[1], settings[2]);
          this.settings.set('galaxyAnimation', settings[0]);
          this.settings.set('galaxyAudio', settings[1]);
          this.settings.set('starAudio', settings[2]);
          localStorage.setItem('settings', JSON.stringify(Array.from(this.settings.entries())));
        }
      });
  }

  adjustSettings(galaxyAnimation, galaxyAudio, starAudio) {
    if (galaxyAnimation) {
      this.glslSandbox.play();
    } else {
      this.glslSandbox.pause();
    }

    if (galaxyAudio) {
      this.galaxyAudio.play();
    } else {
      this.galaxyAudio.pause();
    }

    this.playStarAudio = starAudio;
  }

  solveMaze() {
    this.solution = Cell.solve(Cell.list[0][0], Cell.list[AppConstants.PADS_X - 1][AppConstants.PADS_Y - 1]);
    this.solution.pop();
    this.solution.shift();
    this.star = [0, 0];
    this.mazeSolved = true;
  }

  resetMaze() {
    this.solution = [];
    Cell.list = [];
    this.star = [0, 0];
    this.generateMaze();
    this.mazeSolved = false;
    this.fadeOut = false;
  }
}
