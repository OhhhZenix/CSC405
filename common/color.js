// Converts hex code to floating RGB
function hexToFloatColor(hex) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, "");

  // Parse the hex color to get the red, green, and blue components
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Convert the decimal values to the range [0, 1]
  let rFloat = r / 255;
  let gFloat = g / 255;
  let bFloat = b / 255;

  // Return the result
  return [rFloat, gFloat, bFloat];
}
