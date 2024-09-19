"use strict";

// Import glMatrix data types
const mat4 = glMatrix.mat4;
const vec4 = glMatrix.vec4;

// Vertex shader source code
// The vertex shader is responsible for processing each vertex's data.
const vertexSource = `# version 300 es

in vec3 aPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0);
}
`;

// Fragment shader source code
// The fragment shader determines the color of each pixel.
const fragmentSource = `# version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 0.7, 1.0);
}
`;

// Globals
let v = [
  vec4.fromValues(0.0, 0.0, 1.0, 1.0),
  vec4.fromValues(0.0, 0.942809, -0.333333, 1.0),
  vec4.fromValues(-0.816497, -0.471405, -0.333333, 1.0),
  vec4.fromValues(0.816497, -0.471405, -0.333333, 1.0),
];
let data = [];
let k = 0;

function triangle(a, b, c) {
  data[k] = a;
  k++;
  data[k] = b;
  k++;
  data[k] = c;
  k++;
}

function tetrahedron() {
  triangle(v[0], v[1], v[2]);
  triangle(v[3], v[2], v[1]);
  triangle(v[0], v[3], v[1]);
  triangle(v[0], v[2], v[3]);
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

  // Renders onto the canvas using WebGL.
  function render() {
    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Update viewport size
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Request the next frame
    requestAnimationFrame(render);
  }

  // Run render
  requestAnimationFrame(render);
}

window.onload = main;
