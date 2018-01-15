import { IShape } from './IShape';

export class CCircle implements IShape {
  public x = 0;
  public y = 0;
  public radius = 15;
  public color = 'red';

  constructor(x: number, y: number, radius: number, color: string = 'red') {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
  }

  public draw(context: CanvasRenderingContext2D) {
    context.save();
    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    context.fill();
    context.restore();
  }
}
