import { Component, AfterContentInit } from '@angular/core';

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
  }

  // To retain scope (this) in event listener, I use Lambda expression
  private windowUpdate = () => {
    const galaxy = document.getElementById('galaxyBackground');
    galaxy.setAttribute('width', window.innerWidth + '');
    galaxy.setAttribute('height', window.innerHeight + '');
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
