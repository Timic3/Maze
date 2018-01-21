
export class Utilities {
  public static lerp(a, b, u) {
    return (1 - u) * a + u * b;
  }
}

export class Easing {
  public static easeInQuad(t: number) {
    return t * t;
  }

  public static easeInCubic(t: number) {
    return t * t * t;
  }

  public static easeOutCubic(t: number) {
    return (--t) * t * t + 1;
  }

  public static easeInOutCubic(t: number) {
    if ((t /= 1 / 2) < 1) {
      return 1 / 2 * t * t * t;
    }
    return 1 / 2 * ((t -= 2) * t * t + 2);
  }
}
