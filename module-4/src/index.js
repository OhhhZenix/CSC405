"use strict";

// Import glMatrix data types
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

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

uniform vec3 uColor;
out vec4 fragColor;

void main() {
  fragColor = vec4(uColor, 1.0);
}
`;

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

// Creates color from hex code
function createColor(hex) {
  const color = vec3.create();
  const [r, g, b] = hexToFloatColor(hex);
  return vec3.set(color, r, g, b);
}

// Turns degrees into radians
function toRadian(degree) {
  return degree * (Math.PI / 180);
}

// Creates matrix for rotation on x-axis
function rotateX(angle) {
  const mat = mat4.create();
  return mat4.rotateX(mat, mat, angle);
}

// Creates matrix for rotation on y-axis
function rotateY(angle) {
  const mat = mat4.create();
  return mat4.rotateY(mat, mat, angle);
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
  // Get color location in shader
  const colorLocation = gl.getUniformLocation(program, "uColor");

  // Setup control for cube color
  cubeColor.onchange = (event) => {
    color = createColor(event.target.value);
  };

  // Vertices needed to form a cube
  // 3 vertices per triangle
  // 2 triangles per side
  // 6 sides per cube
  const vertices = [
    // Top
    -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
    // Left
    -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
    // Right
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,
    // Front
    1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0,
    // Back
    1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0,
    // Bottom
    -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
  ];

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Indices needed to create a cube from vertices
  const indices = [
    // Top
    0, 1, 2, 0, 2, 3,
    // Left
    5, 4, 6, 6, 4, 7,
    // Right
    8, 9, 10, 8, 10, 11,
    // Front
    13, 12, 14, 15, 14, 12,
    // Back
    16, 17, 18, 16, 18, 19,
    // Bottom
    21, 20, 22, 22, 20, 23,
  ];

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, gl.FALSE, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  const modelMatrix = mat4.create();
  const viewMatrix = mat4.lookAt(
    mat4.create(),
    vec3.set(vec3.create(), 0, 0, -5),
    vec3.zero(vec3.create()),
    vec3.set(vec3.create(), 0, 1, 0),
  );
  const projectionMatrix = mat4.perspective(
    mat4.create(),
    toRadian(45),
    window.innerWidth / window.innerHeight,
    0.1,
    1000.0,
  );

  gl.uniformMatrix4fv(modelLocation, gl.FALSE, modelMatrix);
  gl.uniformMatrix4fv(viewLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(projectionLocation, gl.FALSE, projectionMatrix);

  let angle = 0;
  let rotationX = mat4.create();
  let rotationY = mat4.create();

  // Renders onto the canvas using WebGL.
  function render() {
    angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
    rotationX = rotateX(angle);
    rotationY = rotateY(angle / 4);
    mat4.mul(modelMatrix, rotationY, rotationX);
    gl.uniformMatrix4fv(modelLocation, gl.FALSE, modelMatrix);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Bind color
    gl.uniform3fv(colorLocation, color);

    // Draw cube
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    // Re-render on the next frame.
    requestAnimationFrame(render);
  }

  // Run render
  requestAnimationFrame(render);
}

// Starts the application
window.onload = main;
