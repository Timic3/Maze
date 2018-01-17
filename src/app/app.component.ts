import { Component, AfterContentInit, HostListener } from '@angular/core';

import { AppConstants } from './app.constants';
import { CCircle } from './classes/CCircle';

// Find another way to link it with NPM
declare var GlslCanvas: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterContentInit {
  private glslSandbox: any;
  private animationsEnabled = true;
  private animationText = 'Disable fancy animations';

  private game: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private star: CCircle;
  private mouseDown = false;

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
    this.windowUpdate();
    window.addEventListener('resize', this.windowUpdate, false);

    // Game
    this.game = <HTMLCanvasElement>document.getElementById('game');
    this.context = this.game.getContext('2d');
    this.game.setAttribute('width', String(AppConstants.GAME_WIDTH));
    this.game.setAttribute('height', String(AppConstants.GAME_HEIGHT));

    this.star = new CCircle(10, 10, 15);

    this.gameLoop();
  }

  gameLoop = () => {
    requestAnimationFrame(this.gameLoop);
    this.context.clearRect(0, 0, AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);
    this.context.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.context.fillRect(0, 0, AppConstants.GAME_WIDTH, AppConstants.GAME_HEIGHT);
    /*const spacingW = (this.GAME_X / 14 - 5);
    const spacingH = (this.GAME_Y / 14 - 5);
    const spacingRatio = (2 / 5);
    for (let x = 0; x < this.GAME_X / (this.GAME_X / 14); x++) {
      for (let y = 0; y < this.GAME_Y / (this.GAME_Y / 14); y++) {
        const padX = x * (this.GAME_X / 14 + spacingRatio);
        const padY = y * (this.GAME_X / 14 + spacingRatio);
        if (this.star.x > padX && this.star.x < padX + spacingW &&
            this.star.y > padY && this.star.y < padY + spacingH) {
          this.context.fillStyle = 'rgba(255, 0, 255, 1)';
        } else {
          this.context.fillStyle = 'rgba(255, 255, 255, 1)';
        }
        this.context.fillRect(padX, padY, spacingW, spacingH);
      }
    }*/
    for (let x = 0; x <= AppConstants.PADS_X; x++) {
      for (let y = 0; y <= AppConstants.PADS_Y; y++) {
        const padX = x * AppConstants.PADS_WIDTH + AppConstants.SPACING;
        const padY = y * AppConstants.PADS_HEIGHT + AppConstants.SPACING;
        const padWidth = AppConstants.PADS_WIDTH - AppConstants.SPACING * 2;
        const padHeight = AppConstants.PADS_HEIGHT - AppConstants.SPACING * 2;
        if (this.star.x >= padX - AppConstants.SPACING && this.star.x < padX + padWidth + AppConstants.SPACING &&
            this.star.y >= padY - AppConstants.SPACING && this.star.y < padY + padHeight + AppConstants.SPACING) {
          this.context.fillStyle = 'rgb(255, 255, 255)';
        } else {
          this.context.fillStyle = 'rgb(200, 200, 200)';
        }
        this.context.fillRect(padX, padY, padWidth, padHeight);
      }
    }
    // this.star.draw(this.context);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const canvasBounds = this.game.getBoundingClientRect();
    const mouseX = event.clientX - canvasBounds.left;
    const mouseY = event.clientY - canvasBounds.top;
    this.star.x = mouseX;
    this.star.y = mouseY;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    this.mouseDown = true;
    this.star.color = 'blue';
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.mouseDown = false;
    this.star.color = 'red';
  }

  // To retain scope (this) in event listener, I use Lambda expression
  windowUpdate = () => {
    const galaxy = document.getElementById('galaxyBackground');
    galaxy.setAttribute('width', String(window.innerWidth));
    galaxy.setAttribute('height', String(window.innerHeight));
    // Update GL viewport to fit the canvas
    this.glslSandbox.gl.viewport(0, 0, this.glslSandbox.gl.canvas.width, this.glslSandbox.canvas.height);
  }

  switchAnimations() {
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
}
