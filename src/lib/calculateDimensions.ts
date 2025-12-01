/**
 * Calculates the width (x) and height (y) of a screen given its diagonal size and aspect ratio.
 *
 * @param {number} diagonal The diagonal size of the screen in inches.
 * @param aspectRatio The aspect ratio as a tuple (e.g. [16, 9] = 16:9).
 * @returns A tuple containing [width, height] in inches.
 */
function calculateDimensions(diagonal: number, aspectRatio: [x: number, y: number]): [x: number, y: number] {
  const actualAspectRatio = aspectRatio[0] / aspectRatio[1];

  const R_squared = actualAspectRatio * actualAspectRatio;
  const denominator = Math.sqrt(R_squared + 1);
  const height = diagonal / denominator;
  const width = actualAspectRatio * height;

  return [width, height];
}

export default calculateDimensions;
