"use strict";

// Vertex shader source code
// The vertex shader is responsible for processing each vertex's position.
const vertexShader = `
attribute vec4 aPosition;

void main() {
	gl_Position = aPosition;
}
`;

// Fragment shader source code
// The fragment shader determines the color of each pixel.
const fragmentShader = `
precision mediump float;

void main() {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

// Define the vertices of the initial triangle.
const vertices = [
  // Bottom-left vertex
  [-1, -1],
  // Top vertex
  [0, 1],
  // Bottom-right vertex
  [1, -1],
];

// Compiles a shader given its source code and type (vertex or fragment).
// If the shader fails to compile, it logs an error message.
function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation failed:", gl.getShaderInfoLog(shader));
    alert("Failed to compile shader. Check console logs.");
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Creates a shader program by linking the vertex and fragment shaders.
// If the program fails to link, it logs an error message.
function createShaderProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking failed:", gl.getProgramInfoLog(program));
    alert("Failed to link shader program. Check console logs.");
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

// Adds a triangle defined by three vertices (a, b, c) to the triangles array.
function addTriangle(triangles, a, b, c) {
  triangles.push(a, b, c);
}

// Recursively divides a triangle into smaller triangles.
// The 'count' parameter determines how many levels of subdivision will occur.
function divideTriangle(triangles, a, b, c, count) {
  if (count == 0) {
    // Base case: Add the triangle to the list if no more subdivisions are needed.
    addTriangle(triangles, a, b, c);
  } else {
    // Calculate midpoints of each side of the triangle.
    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    count -= 1;

    // Recursively subdivide the triangle into three smaller triangles.
    divideTriangle(triangles, a, ab, ac, count);
    divideTriangle(triangles, c, ac, bc, count);
    divideTriangle(triangles, b, bc, ab, count);
  }
}

// Generates an array of points representing the vertices of all triangles
// needed to create the Sierpinski Gasket at the specified subdivision level.
function createTriangles(numToSubDiv) {
  const points = [];
  divideTriangle(points, vertices[0], vertices[1], vertices[2], numToSubDiv);
  return points;
}

// Renders the triangles onto the canvas using WebGL.
function render(gl, points) {
  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Load the vertex data into the buffer.
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);
  // Draw the triangles.
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  // Re-render on the next frame.
  requestAnimationFrame(() => render(gl, points));
}

// Main function that sets up the WebGL context and starts the rendering process.
function main() {
  // Setup canvas
  const canvas = document.getElementById("gl-canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Initialize WebGL context.
  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to init WebGL. Your browser or computer may not support it.");
    return;
  }

  // Set the viewport to match the canvas size.
  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set the clear color (background color) to black.
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Create and use the shader program.
  const program = createShaderProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    alert("Failed to create shader!");
    return;
  }
  gl.useProgram(program);

  // Create a buffer to store vertex data.
  const arrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);

  // Bind the 'aPosition' attribute in the shader to the buffer data.
  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  // Set up the slider to control the recursion depth.
  const slider = document.getElementById("recursionDepth");
  slider.onchange = function (event) {
    const numToSubDiv = parseInt(event.target.value);

    const sliderLabel = document.getElementById("recursionDepthLabel");
    sliderLabel.innerHTML = "Recursion Depth: " + numToSubDiv;

    // Create triangles based on the selected recursion depth and render them.
    const triangles = createTriangles(numToSubDiv);
    render(gl, triangles);
  };

  // Initial rendering with the default recursion depth.
  const triangles = createTriangles(slider.value);
  render(gl, triangles);
}

// Start the WebGL program when the window loads.
window.onload = main;
