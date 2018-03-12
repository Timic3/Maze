import { Component, AfterViewInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material';

import { SettingsComponent } from './settings/settings.component';
import { HelloComponent } from './hello/hello.component';

import { AppConstants } from './app.constants';
import { Cell, Walls } from './classes/Cell';
import { Gradient } from './classes/Gradient';
import { Easing } from './classes/Utilities';
import { StarParticle } from './classes/StarParticle';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  public game: HTMLCanvasElement;
  public gameStarted = false;
  public galaxyAudio;
  public starAudio;
  public playStarAudio = true;
  public context: CanvasRenderingContext2D;
  public galaxyContext: CanvasRenderingContext2D;
  public solution;

  public starfield = [];

  public gradient: Gradient;

  public star: number[] = [];
  public starredPad: Cell;
  public mazeSolved = false;
  public fadeOut = false;
  public fadeStep = 0;

  public settings: Map<String, any> = new Map<String, any>();

  // FPS stuff
  public now = [];
  public then = [];
  public elapsed = [];

  public starFPS = 27;

  constructor(public dialog: MatDialog) { }

  ngAfterViewInit() {
    this.initiateHelloScreen();

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

    setTimeout(() => {
      const galaxy = <HTMLCanvasElement>document.getElementById('galaxy');
      this.galaxyContext = <CanvasRenderingContext2D>galaxy.getContext('2d');
      for (let i = 0; i < 100; i++) {
        this.starfield[i] = new StarParticle(this.galaxyContext);
        this.starfield[i].reset();
      }

      this.then[0] = Date.now();
      this.starLoop();
    });
  }

  postHelloScreen() {
    // Set up gradient background
    this.gradient = new Gradient(AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);

    this.gradient.addStop(0, [
      [16, 100, 228],
      [63, 135, 228],
      [50, 218, 228],
      [98, 228, 188],
      [105, 228, 140]
    ]);

    this.gradient.addStop(1, [
      [50, 218, 228],
      [105, 228, 140],
      [98, 228, 188],
      [16, 100, 228],
      [63, 135, 228]
    ]);

    // Game
    this.game = <HTMLCanvasElement>document.getElementById('game');
    this.context = this.game.getContext('2d');
    this.game.setAttribute('width', String(AppConstants.GAME_WIDTH));
    this.game.setAttribute('height', String(AppConstants.GAME_HEIGHT));

    this.star = [0, 0];

    // Generate
    this.generateMaze();

    // Start rendering
    this.then[1] = Date.now();
    this.gameLoop();
  }

  starLoop = () => {
    requestAnimationFrame(this.starLoop);
    this.now[0] = Date.now();
    this.elapsed[0] = this.now[0] - this.then[0];

    // Limit FPS to 27
    if (this.elapsed[0] > 1000 / this.starFPS) {
      this.then[0] = this.now[0] - (this.elapsed[0] % (1000 / this.starFPS));

      this.galaxyContext.clearRect(0, 0, StarParticle.width, StarParticle.height);
      this.galaxyContext.globalCompositeOperation = 'lighter';
      for (let i = 0; i < this.starfield.length; i++) {
        this.starfield[i].fade();
        this.starfield[i].move();
        this.starfield[i].draw();
      }
    }
  }

  // Retain scope (this) using Lambda expression.
  gameLoop = () => {
    requestAnimationFrame(this.gameLoop);
    this.now[1] = Date.now();
    this.elapsed[1] = this.now[1] - this.then[1];

    // Limit FPS to 60
    if (this.elapsed[1] > 1000 / 60) {
      this.then[1] = this.now[1] - (this.elapsed[1] % (1000 / 60));

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
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event) {
    const galaxy = document.getElementById('galaxy');
    galaxy.setAttribute('width', String(event.target.innerWidth));
    galaxy.setAttribute('height', String(event.target.innerHeight));
    StarParticle.width = event.target.innerWidth;
    StarParticle.height = event.target.innerHeight;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.gameStarted) {
      return;
    }
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
      height: '350px',
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

  initiateHelloScreen() {
    // Temporary work around due to change detection hook bug
    // https://github.com/angular/angular/issues/15634
    setTimeout(() => {
      const dialog = this.dialog.open(HelloComponent, {
        width: '500px',
        disableClose: true,
        data: {
        }
      });
      dialog.afterClosed()
        .subscribe(() => {
          this.postHelloScreen();
          this.gameStarted = true;
        });
      const galaxy = document.getElementById('galaxy');
      galaxy.setAttribute('width', String(window.innerWidth));
      galaxy.setAttribute('height', String(window.innerHeight));
      StarParticle.width = window.innerWidth;
      StarParticle.height = window.innerHeight;
    });
  }

  adjustSettings(galaxyAnimation, galaxyAudio, starAudio) {
    if (galaxyAnimation) {
      this.starFPS = 27;
    } else {
      this.starFPS = 0;
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
