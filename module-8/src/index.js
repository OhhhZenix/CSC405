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

function addObject(objects, id, position, color, depth, scale) {
  objects.push({
    id: id,
    position: position,
    color: color,
    depth: depth,
    scale: scale,
  });
}

function sortObjects(objects) {
  objects.sort((a, b) => a.depth - b.depth);
}

function toBufferData(objects) {
  let bufferData = [];
  objects.forEach((object) =>
    bufferData.push(
      ...createTriangle(object.position, object.color, object.scale),
    ),
  );
  return bufferData;
}

function setObjectColor(objects, id, color) {
  const object = objects.find((obj) => obj.id === id);
  if (object) {
    object.color = color;
  }
}

function setObjectDepth(objects, id, depth) {
  const object = objects.find((obj) => obj.id === id);
  if (object) {
    object.depth = depth;
  }
}

function main() {
  // Initialize the canvas
  const canvas = initCanvas("gl-canvas");
  // Initialize WebGL context
  const gl = initWebGL(canvas);
  // Create shader program
  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  // Use the created program
  gl.useProgram(program);

  const keys = ["triangle-1", "triangle-2", "triangle-3"];
  const trianglePositions = [
    [1, 0],
    [0, 0],
    [-1, 0],
  ];
  const triangleColors = keys.map((value) =>
    document.getElementById(`${value}-color`),
  );
  const triangleDepths = keys.map((value) =>
    document.getElementById(`${value}-depth`),
  );
  const triangleScales = [3.0, 2.5, 2.0];
  let objects = [];

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
  sortObjects(objects);

  let vertexData = toBufferData(objects);
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const positionSize = 2;
  const colorSize = 3;
  const totalSize = positionSize + colorSize;
  const stride = totalSize * Float32Array.BYTES_PER_ELEMENT;
  const positionOffset = positionSize * Float32Array.BYTES_PER_ELEMENT;

  function setupAttribute(location, size, stride, offset) {
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
    gl.enableVertexAttribArray(location);
  }

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const colorLocation = gl.getAttribLocation(program, "aColor");

  setupAttribute(positionLocation, positionSize, stride, 0);
  setupAttribute(colorLocation, colorSize, stride, positionOffset);

  function updateBuffer() {
    vertexData = toBufferData(objects);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW,
    );
  }

  keys.forEach((value, i) => {
    triangleColors[i].onchange = (event) => {
      setObjectColor(objects, value, hexToFloatColor(event.target.value));
      updateBuffer();
    };
  });

  keys.forEach((value, i) => {
    triangleDepths[i].onchange = (event) => {
      setObjectDepth(objects, value, event.target.value);
      sortObjects(objects);
      updateBuffer();
    };
  });

  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  let modelMatrix = mat4();
  const viewMatrix = lookAt(vec3(0, 0, -5), vec3(0, 0, 0), vec3(0, 1, 0));
  const projectionMatrix = perspective(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000.0,
  );

  gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));
  gl.uniformMatrix4fv(viewLocation, gl.FALSE, flatten(viewMatrix));
  gl.uniformMatrix4fv(projectionLocation, gl.FALSE, flatten(projectionMatrix));

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
