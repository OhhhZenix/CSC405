"use strict";

// Vertex Shader Source Code
const vertexSource = `# version 300 es

in vec4 aPosition;

void main() {
  gl_Position = aPosition;
}
`;

// Fragment Shader Source Code
const fragmentSource = `# version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

function main() {
  // Initialize the canvas
  const canvas = initCanvas("gl-canvas");
  // Initialize WebGL context
  const gl = initWebGL(canvas);
  // Create shader program
  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  // Use the created program
  gl.useProgram(program);

  function render() {
    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Clear the screen and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    // Request the next frame for animation
    requestAnimationFrame(render);
  }

  // Start the rendering process
  render();
}

// Starts the application when the window loads
window.onload = main;
