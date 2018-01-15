export interface IShape {
  x: number;
  y: number;
  radius: number;
  color: string;
  draw(context: CanvasRenderingContext2D): void;
}
