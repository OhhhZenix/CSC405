"use strict";

// Import glMatrix data types
const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;

// Vertex shader source code
// The vertex shader is responsible for processing each vertex's data.
const vertexSource = `# version 300 es

in vec2 aPosition;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

void main() {
  gl_Position = uProjection * uView * uModel * vec4(aPosition, 0.0, 1.0);
}
`;

// Fragment shader source code
// The fragment shader determines the color of each pixel.
const fragmentSource = `# version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, 1.0);
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

  const vertices = [-0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, -0.5];
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  const indices = [0, 1, 2, 2, 3, 0];
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW,
  );

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);
  gl.enableVertexAttribArray(positionLocation);

  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  let left = -1;
  let right = 1;
  let bottom = -1;
  let top = 1;
  let near = 0.1;
  let far = 3;
  let radius = 1;
  let theta = 0;
  let phi = 0;
  const dr = toRadian(5);

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

    console.log(left, right, bottom, top, near, far, radius, theta, phi);
  };

  const modelMatrix = mat4.create();
  const eye = vec3.fromValues(
    radius * Math.cos(theta),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi),
  );
  const center = vec3.fromValues(0, 0, 0);
  const up = vec3.fromValues(0, 1, 0);
  const viewMatrix = mat4.lookAt(mat4.create(), eye, center, up);
  const projectionMatrix = mat4.ortho(
    mat4.create(),
    left,
    right,
    bottom,
    top,
    near,
    far,
  );

  gl.uniformMatrix4fv(modelLocation, gl.FALSE, modelMatrix);
  gl.uniformMatrix4fv(viewLocation, gl.FALSE, viewMatrix);
  gl.uniformMatrix4fv(projectionLocation, gl.FALSE, projectionMatrix);

  function render() {
    vec3.set(
      eye,
      radius * Math.cos(theta),
      radius * Math.cos(theta),
      radius * Math.sin(theta) * Math.sin(phi),
    );
    mat4.lookAt(viewMatrix, eye, center, up);
    mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);
    gl.uniformMatrix4fv(viewLocation, gl.FALSE, viewMatrix);
    gl.uniformMatrix4fv(projectionLocation, gl.FALSE, projectionMatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

window.onload = main;
