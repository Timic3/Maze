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

  ngAfterContentInit() {
    // Construct GLSL sandbox
    const galaxy = document.getElementById('galaxyBackground');
    this.glslSandbox = new GlslCanvas(galaxy);

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
}
