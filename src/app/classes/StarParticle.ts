export class StarParticle {
  static width;
  static height;

  public x: number;
  public y: number;
  public r: number; // Radius
  public dx: number; // Movement
  public dy: number;
  public life: number; // Life
  public blink: number; // Fade
  public blinkUnit: number; // Blink time
  public stop: number;

  private context: CanvasRenderingContext2D;

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  reset() {
    this.x = StarParticle.width * Math.random();
    this.y = StarParticle.height * Math.random();
    this.r = 8 * Math.random() + 1;
    this.dx = (Math.random() * 5) * (Math.random() < 0.5 ? -1 : 1);
    this.dy = (Math.random() * 2) * (Math.random() < 0.5 ? -1 : 1);
    this.life = 300 * (this.r / 9);
    this.blink = Math.random() * this.life;
    this.blinkUnit = Math.random() + 1;
    this.stop = Math.random() * 0.2 + 0.4;
  }

  fade() {
    this.blink += this.blinkUnit;
  }

  draw() {
    if (this.blink <= 0 || this.blink >= this.life) {
      this.blinkUnit = this.blinkUnit * -1;
    } else if (this.blink >= this.life) {
      this.reset();
    }

    this.context.beginPath();
    this.context.arc(this.x, this.y, this.r, 0, Math.PI * 2, true);
    this.context.closePath();

    const unit = 1 - (this.blink / this.life);
    const life = this.r * unit;
    const gradient = this.context.createRadialGradient(this.x, this.y, 0, this.x, this.y, (life <= 0 ? 1 : life));
    gradient.addColorStop(0.0, 'rgba(193, 254, 254, ' + unit + ')');
    gradient.addColorStop(this.stop, 'rgba(193, 254, 254, ' + unit * 0.3 + ')');
    gradient.addColorStop(1.0, 'rgba(193, 254, 254, 0)');
    this.context.fillStyle = gradient;
    this.context.fill();
  }

  move() {
    this.x += (this.blink / this.life) * this.dx;
    this.y += (this.blink / this.life) * this.dy;
    if (this.x > StarParticle.width || this.x < 0) {
      this.dx *= -1;
    }
    if (this.y > StarParticle.height || this.y < 0) {
      this.dy *= -1;
    }
  }
}
