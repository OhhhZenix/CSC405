"use strict";

// Vertex shader source code
// The vertex shader is responsible for processing each vertex's data.
const vertexSource = `# version 300 es

in vec4 aPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
  gl_Position = uProjection * uView * uModel * aPosition;
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

// Array to hold vertex data
let vertices = [];

// Tracks the length of the vertices
let index = 0;

// Resets sphere data
function resetData() {
  vertices = [];
  index = 0;
}

// Push three vertices (a triangle) into the vertices array
function triangle(a, b, c) {
  vertices.push(...a);
  vertices.push(...b);
  vertices.push(...c);
  index += 3;
}

// Recursively divides a triangle into smaller triangles
function divideTriangle(a, b, c, n) {
  if (n > 0) {
    // Calculate midpoints of the edges
    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    // Recursively divide the triangle
    divideTriangle(a, ab, ac, n - 1);
    divideTriangle(ab, b, bc, n - 1);
    divideTriangle(bc, c, ac, n - 1);
    divideTriangle(ab, bc, ac, n - 1);
  } else {
    // Base case: create a triangle
    triangle(a, b, c);
  }
}

// Generates a tetrahedron by dividing its triangular faces
function tetrahedron(n) {
  const a = vec4(0.0, 0.0, -1.0, 1);
  const b = vec4(0.0, 0.942809, 0.3333, 1);
  const c = vec4(-0.816497, -0.471405, 0.3333, 1);
  const d = vec4(0.816497, -0.471405, 0.3333, 1);

  // Divide each face of the tetrahedron
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

// Main function to set up and start the rendering
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

  // Access UI elements for color selection
  const sphereColorUi = document.getElementById("sphere-color");
  const outlineColorUi = document.getElementById("outline-color");
  let sphereColor = hexToFloatColor(sphereColorUi.value);
  let outlineColor = hexToFloatColor(outlineColorUi.value);

  // Setup control for sphere color
  sphereColorUi.onchange = (event) => {
    sphereColor = hexToFloatColor(event.target.value);
  };

  // Setup control for outline color
  outlineColorUi.onchange = (event) => {
    outlineColor = hexToFloatColor(event.target.value);
  };

  // Get the uniform location for color
  const colorLocation = gl.getUniformLocation(program, "uColor");

  // Setup smoothness control for the sphere
  const smoothnessUi = document.getElementById("smoothness");
  const smoothnessLabelUi = document.getElementById("smoothnessLabel");
  // Display current smoothness
  smoothnessLabelUi.innerHTML = smoothnessUi.value;
  // Generate initial sphere data
  tetrahedron(smoothnessUi.value);

  // Create and bind vertex buffer
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Setup smoothness control
  smoothnessUi.onchange = (event) => {
    const value = event.target.value;
    // Update ui label
    smoothnessLabelUi.innerHTML = value;
    // Reset data
    resetData();
    // Generate new sphere data
    tetrahedron(value);
    // Rebind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    // Update buffer data
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  };

  // Get attribute location and enable vertex attribute array
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLocation, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  // Get uniform locations for MVP matrices
  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  // Create model matrix
  let modelMatrix = mat4();
  // Create view matrix with a camera looking at the origin from a distance
  const viewMatrix = lookAt(vec3(0, 0, -5), vec3(0, 0, 0), vec3(0, 1, 0));
  // Create projection matrix with a perspective view
  const projectionMatrix = perspective(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000.0,
  );

  // Set uniform MVP matrices in shader
  gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));
  gl.uniformMatrix4fv(viewLocation, gl.FALSE, flatten(viewMatrix));
  gl.uniformMatrix4fv(projectionLocation, gl.FALSE, flatten(projectionMatrix));

  // Initialize rotation variables
  let mouseDown = false;
  let lastX = 0;
  let lastY = 0;
  let angleX = 0;
  let angleY = 0;
  const rotationSpeed = 0.75;

  // Handle mouse down event for rotation
  canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  // Handle mouse up event to stop rotation
  canvas.addEventListener("mouseup", () => {
    mouseDown = false;
  });

  // Handle mouse move event to update rotation angles
  canvas.addEventListener("mousemove", (event) => {
    if (mouseDown) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;

      angleX += deltaY * rotationSpeed;
      angleY += deltaX * rotationSpeed;

      lastX = event.clientX;
      lastY = event.clientY;
    }
  });

  // Initialize rotation matrices
  let rotationX = mat4();
  let rotationY = mat4();

  // Renders onto the canvas using WebGL.
  function render() {
    // Update viewport size
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update rotation
    rotationX = rotate(angleX, vec3(1, 0, 0));
    rotationY = rotate(angleY, vec3(0, 1, 0));

    // Apply rotation
    modelMatrix = mult(rotationX, rotationY);
    gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));

    // Bind sphere color and draw the sphere
    gl.uniform3fv(colorLocation, sphereColor);
    gl.drawArrays(gl.TRIANGLES, 0, index);

    // Bind outline color and draw the outline
    gl.uniform3fv(colorLocation, outlineColor);
    for (let i = 0; i < index; i += 3) {
      // Draw outline of each triangle
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }

    // Request the next frame
    requestAnimationFrame(render);
  }

  // Run render
  requestAnimationFrame(render);
}

// Starts the application
window.onload = main;
