export class AppConstants {
  // Game width and height
  static readonly GAME_WIDTH = 700;
  static readonly GAME_HEIGHT = 700;

  // Number of pads per axis
  static readonly PADS_X = 25;
  static readonly PADS_Y = 25;

  // Pad width and height
  static readonly PADS_WIDTH = AppConstants.GAME_WIDTH / AppConstants.PADS_X;
  static readonly PADS_HEIGHT = AppConstants.GAME_HEIGHT / AppConstants.PADS_Y;

  // Spacing between pads
  static readonly SPACING = 1;
}
