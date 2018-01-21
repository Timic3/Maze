import { Utilities } from './Utilities';

// Original code by Kevin Ports (https://github.com/kevinports)
// Edited and TypeScript-ified by Timic3
export class Gradient {
  static readonly DURATION = 1000;
  static readonly INTERVAL = 10;

  public width: number;
  public height: number;

  protected colorStops = [];
  protected currentStop = 0;
  protected currentUnit = 0.0;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  addStop(position, colors) {
    this.colorStops.push({
      'position': position,
      'colors': colors,
      'currentColor': null
    });
  }

  // Interpolate colors of stops
  updateStops() {
    const steps = Gradient.DURATION / Gradient.INTERVAL,
          stepUnit = 1.0 / steps,
          stopsLength = this.colorStops[0].colors.length - 1;

    // Cycle through all stops in gradient
    for (let i = 0; i < this.colorStops.length; i++) {
      const stop = this.colorStops[i];
      const startColor = stop.colors[this.currentStop];

      let endColor, r, g, b;

      if (this.currentStop < stopsLength) {
        endColor = stop.colors[this.currentStop + 1];
      } else {
        endColor = stop.colors[0];
      }

      // Interpolate 2 colors based on animation unit, so we get sick animation
      r = Math.floor(Utilities.lerp(startColor[0], endColor[0], this.currentUnit));
      g = Math.floor(Utilities.lerp(startColor[1], endColor[1], this.currentUnit));
      b = Math.floor(Utilities.lerp(startColor[2], endColor[2], this.currentUnit));

      stop.currentColor = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    // Update animation unit
    if (this.currentUnit >= 1.0) {
      this.currentUnit = 0.0;
      if (this.currentStop < stopsLength) {
        this.currentStop++;
      } else {
        this.currentStop = 0.0;
      }
    }

    // Increment animation unit
    this.currentUnit += stepUnit;
  }

  getGradient(context: CanvasRenderingContext2D): CanvasGradient {
    const gradient = context.createLinearGradient(0, this.width, this.height, 0);
    for (let i = 0; i < this.colorStops.length; i++) {
      const stop = this.colorStops[i];
      const position = stop.position,
            color = stop.currentColor;

      gradient.addColorStop(position, color);
    }

    return gradient;
  }

  // Might not even use it
  draw(context: CanvasRenderingContext2D) {
    const gradient = context.createLinearGradient(0, this.width, this.height, 0);

    for (let i = 0; i < this.colorStops.length; i++) {
      const stop = this.colorStops[i];
      const position = stop.position,
            color = stop.currentColor;

      gradient.addColorStop(position, color);
    }

    context.clearRect(0, 0, this.width, this.height);
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.width, this.height);
  }
}
