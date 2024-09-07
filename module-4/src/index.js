"use strict";

// Import glMatrix data types
const mat4 = glMatrix.mat4;
const vec4 = glMatrix.vec4;

// Vertex shader source code
// The vertex shader is responsible for processing each vertex's data.
const vertexSource = `# version 300 es

in vec4 aPosition;

void main() {
  gl_Position = aPosition;
}
`;

// Fragment shader source code
// The fragment shader determines the color of each pixel.
const fragmentSource = `# version 300 es
precision highp float;

uniform vec4 uColor;
out vec4 fragColor;

void main() {
  fragColor = uColor;
}
`;

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

function createColor(hex) {
  const color = vec4.create();
  const [r, g, b] = hexToFloatColor(hex);
  return vec4.set(color, r, g, b, 1.0);
}

// Renders onto the canvas using WebGL.
function render(gl) {
  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Re-render on the next frame.
  requestAnimationFrame(() => render(gl));
}

function main() {
  // Setup the canvas
  const canvas = initCanvas("gl-canvas");
  // Setup a WebGL context
  const gl = initWebGL(canvas);
  // Create shader program
  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  // Use the shader program created
  gl.useProgram(program);

  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  // Near things obscure far things
  gl.depthFunc(gl.LEQUAL);

  // Access the color data from ui
  const cubeColor = document.getElementById("cube-color");
  // Create color from  data
  let color = createColor(cubeColor.value);

  // Setup control for cube color
  cubeColor.onchange = (event) => {
    color = createColor(event.target.value);
    console.log(color);
  };

  // Run render
  render(gl);
}

// Starts the application
window.onload = main;
