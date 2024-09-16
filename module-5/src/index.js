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

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 0.7, 1.0);
}
`;

// Turns degrees into radians
function toRadian(degree) {
  return degree * (Math.PI / 180);
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

  // Vertices for a cube
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

  // Indices for a cube
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
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  let left = -10;
  let right = 10;
  let bottom = -6;
  let top = 6;
  let near = 0.1;
  let far = 3;
  let radius = 1;
  let theta = 26;
  let phi = 18;
  const dr = toRadian(5);

  const leftLabel = document.getElementById("left");
  const rightLabel = document.getElementById("right");
  const bottomLabel = document.getElementById("bottom");
  const topLabel = document.getElementById("top");
  const nearLabel = document.getElementById("near");
  const farLabel = document.getElementById("far");
  const radiusLabel = document.getElementById("radius");
  const thetaLabel = document.getElementById("theta");
  const phiLabel = document.getElementById("phi");

  function updateLabels() {
    leftLabel.innerHTML = `Left: ${left.toFixed(2)}`;
    rightLabel.innerHTML = `Right: ${right.toFixed(2)}`;
    bottomLabel.innerHTML = `Bottom: ${bottom.toFixed(2)}`;
    topLabel.innerHTML = `Top: ${top.toFixed(2)}`;
    nearLabel.innerHTML = `Near: ${near.toFixed(2)}`;
    farLabel.innerHTML = `Far: ${far.toFixed(2)}`;
    radiusLabel.innerHTML = `Radius: ${radius.toFixed(2)}`;
    thetaLabel.innerHTML = `Theta: ${theta.toFixed(2)}`;
    phiLabel.innerHTML = `Phi: ${phi.toFixed(2)}`;
  }

  // Set the initial values to labels
  updateLabels();

  window.onkeydown = (event) => {
    const keyCode = event.code;
    const isShift = event.shiftKey;

    if (keyCode === "KeyX") {
      if (isShift) {
        left *= 0.9;
        right *= 0.9;
      } else {
        left *= 1.1;
        right *= 1.1;
      }
    }

    if (keyCode === "KeyY") {
      if (isShift) {
        bottom *= 0.9;
        top *= 0.9;
      } else {
        bottom *= 1.1;
        top *= 1.1;
      }
    }

    if (keyCode === "KeyZ") {
      if (isShift) {
        near *= 0.9;
        far *= 0.9;
      } else {
        near *= 1.1;
        far *= 1.1;
      }
    }

    if (keyCode === "KeyR") {
      if (isShift) {
        radius *= 0.5;
      } else {
        radius *= 2.0;
      }
    }

    if (keyCode === "KeyO") {
      if (isShift) {
        theta -= dr;
      } else {
        theta += dr;
      }
    }

    if (keyCode === "KeyP") {
      if (isShift) {
        phi -= dr;
      } else {
        phi += dr;
      }
    }

    updateLabels();
  };

  function updateMVP() {
    const modelMatrix = mat4.create();
    const eye = vec3.fromValues(
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.cos(phi),
      radius * Math.sin(theta) * Math.sin(phi),
    );
    const center = vec3.fromValues(0, 0, 0);
    const up = vec3.fromValues(0, 1, 0);
    const viewMatrix = mat4.create();
    const projectionMatrix = mat4.create();

    mat4.lookAt(viewMatrix, eye, center, up);
    mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);

    gl.uniformMatrix4fv(modelLocation, false, modelMatrix);
    gl.uniformMatrix4fv(viewLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
  }

  // Renders onto the canvas using WebGL.
  function render() {
    updateMVP();
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.viewport(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(render);
  }

  // Run render
  requestAnimationFrame(render);
}

window.onload = main;
