import { IObject } from './IObject';

export class CCell implements IObject {
  public x;
  public y;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(context: CanvasRenderingContext2D) {
    // Draw stuff

  }
}
