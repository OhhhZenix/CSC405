"use strict";

// Vertex Shader Source Code
const vertexSource = `# version 300 es

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

in vec2 aPosition;
in vec3 aColor;

out vec3 vColor;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 1.0, 1.0);
  vColor = aColor;
}
`;

// Fragment Shader Source Code
const fragmentSource = `# version 300 es
precision highp float;

in vec3 vColor;
out vec4 fragColor;

void main() {
  fragColor = vec4(vColor, 1.0);
}
`;

/**
 * Creates a triangle given its position, color, and scale.
 * @param {Array} position - The x and y coordinates for the triangle's center.
 * @param {Array} color - The RGB color values for the triangle.
 * @param {number} scale - The scale factor for the triangle size.
 * @returns {Float32Array} - The vertex data for the triangle.
 */
function createTriangle(position, color, scale) {
  // Half the size of the triangle
  const halfSize = 0.5 * scale;
  const data = new Float32Array([
    // Bottom left
    position[0] - halfSize,
    position[1] - halfSize,

    // Bottom left color
    color[0],
    color[1],
    color[2],

    // Bottom right
    position[0] + halfSize,
    position[1] - halfSize,

    // Bottom right color
    color[0],
    color[1],
    color[2],

    // Top middle
    position[0],
    position[1] + halfSize,

    // Top middle color
    color[0],
    color[1],
    color[2],
  ]);
  return data;
}

/**
 * Adds an object to the list of objects to be rendered.
 * @param {Array} objects - The array of objects.
 * @param {string} id - Unique identifier for the object.
 * @param {Array} position - The position of the object.
 * @param {Array} color - The color of the object.
 * @param {number} depth - The depth of the object for sorting.
 * @param {number} scale - The scale of the object.
 */
function addObject(objects, id, position, color, depth, scale) {
  objects.push({
    id: id,
    position: position,
    color: color,
    depth: depth,
    scale: scale,
  });
}

/**
 * Sorts the objects based on their depth values.
 * @param {Array} objects - The array of objects to sort.
 */
function sortObjects(objects) {
  objects.sort((a, b) => a.depth - b.depth);
}

/**
 * Converts the list of objects into buffer data for rendering.
 * @param {Array} objects - The array of objects.
 * @returns {Array} - The buffer data containing vertex information.
 */
function toBufferData(objects) {
  let bufferData = [];
  objects.forEach((object) =>
    bufferData.push(
      ...createTriangle(object.position, object.color, object.scale),
    ),
  );
  return bufferData;
}

/**
 * Updates the color of an object identified by its id.
 * @param {Array} objects - The array of objects.
 * @param {string} id - The id of the object to update.
 * @param {Array} color - The new color value.
 */
function setObjectColor(objects, id, color) {
  const object = objects.find((obj) => obj.id === id);
  if (object) {
    // Update color
    object.color = color;
  }
}

/**
 * Updates the depth of an object identified by its id.
 * @param {Array} objects - The array of objects.
 * @param {string} id - The id of the object to update.
 * @param {number} depth - The new depth value.
 */
function setObjectDepth(objects, id, depth) {
  const object = objects.find((obj) => obj.id === id);
  if (object) {
    // Update depth
    object.depth = depth;
  }
}

/**
 * Main function to initialize and start the WebGL application.
 */
function main() {
  // Initialize the canvas
  const canvas = initCanvas("gl-canvas");
  // Initialize WebGL context
  const gl = initWebGL(canvas);
  // Create shader program
  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  // Use the created program
  gl.useProgram(program);

  // Object IDs
  const keys = ["triangle-1", "triangle-2", "triangle-3"];
  // Triangle positions
  const trianglePositions = [
    [1, 0],
    [0, 0],
    [-1, 0],
  ];
  // Color inputs
  const triangleColors = keys.map((value) =>
    document.getElementById(`${value}-color`),
  );
  // Depth inputs
  const triangleDepths = keys.map((value) =>
    document.getElementById(`${value}-depth`),
  );
  // Scale factors
  const triangleScales = [3.0, 2.5, 2.0];
  // Array to hold objects
  let objects = [];

  // Add objects
  keys.forEach((value, i) => {
    addObject(
      objects,
      value,
      trianglePositions[i],
      hexToFloatColor(triangleColors[i].value),
      triangleDepths[i].value,
      triangleScales[i],
    );
  });
  // Sort objects by depth which is the painter's algo
  sortObjects(objects);

  // Create buffer data from objects
  let vertexData = toBufferData(objects);
  // Create vertex buffer
  const vbo = gl.createBuffer();
  // Bind vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // Upload data to GPU
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  // Size of position attribute
  const positionSize = 2;
  // Size of color attribute
  const colorSize = 3;
  // Total size of each vertex
  const totalSize = positionSize + colorSize;
  // Stride for interleaved data
  const stride = totalSize * Float32Array.BYTES_PER_ELEMENT;
  // Offset for position attribute
  const positionOffset = positionSize * Float32Array.BYTES_PER_ELEMENT;

  // Function to set up vertex attribute pointers
  function setupAttribute(location, size, stride, offset) {
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(location);
  }

  // Get position attribute location
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  // Get color attribute location
  const colorLocation = gl.getAttribLocation(program, "aColor");

  // Set up position attribute
  setupAttribute(positionLocation, positionSize, stride, 0);
  // Set up color attribute
  setupAttribute(colorLocation, colorSize, stride, positionOffset);

  // Function to update buffer data
  function updateBuffer() {
    // Create new vertex data from changes
    vertexData = toBufferData(objects);
    // Bind and upload new data to GPU
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW,
    );
  }

  // Set up event listeners for color input changes
  keys.forEach((value, i) => {
    triangleColors[i].onchange = (event) => {
      // Update color
      setObjectColor(objects, value, hexToFloatColor(event.target.value));
      // Refresh buffer
      updateBuffer();
    };
  });

  // Set up event listeners for depth input changes
  keys.forEach((value, i) => {
    triangleDepths[i].onchange = (event) => {
      // Update depth
      setObjectDepth(objects, value, event.target.value);
      // Resort objects by depth for painter's algo
      sortObjects(objects);
      // Refresh buffer
      updateBuffer();
    };
  });

  // Get uniform locations
  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  // Create the MVP matrix
  let modelMatrix = mat4();
  const viewMatrix = lookAt(vec3(0, 0, -5), vec3(0, 0, 0), vec3(0, 1, 0));
  const projectionMatrix = perspective(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000.0,
  );

  // Set uniform matrices
  gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));
  gl.uniformMatrix4fv(viewLocation, gl.FALSE, flatten(viewMatrix));
  gl.uniformMatrix4fv(projectionLocation, gl.FALSE, flatten(projectionMatrix));

  // Render loop
  function render() {
    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Render objects
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / totalSize);

    // Request the next frame for animation
    requestAnimationFrame(render);
  }

  // Start the rendering process
  render();
}

// Starts the application when the window loads
window.onload = main;
