"use strict";

const vertexSource = `# version 300 es

in vec4 aPosition;

void main() {
  gl_Position = aPosition;
}
`;

const fragmentSource = `# version 300 es
precision highp float;

in vec4 aColor;
out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

// Renders onto the canvas using WebGL.
function render(gl) {
  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // Re-render on the next frame.
  requestAnimationFrame(() => render(gl));
}

function main() {
  const canvas = createCanvas("gl-canvas");
  const gl = initWebGL(canvas);
  const program = createShaderProgram(gl, vertexSource, fragmentSource);

  // Run render
  render(gl);
}

// Starts the application
window.onload = main;
