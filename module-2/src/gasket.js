"use strict";

const vertexShader = `
attribute vec4 aPosition;

void main() {
	gl_Position = aPosition;
}
`;

const fragmentShader = `
precision mediump float;

void main() {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
`;

let canvas;
let gl;
let points = [];
let numToSubDiv = 0;

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

function addTriangle(a, b, c) {
  points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {
  if (count == 0) {
    addTriangle(a, b, c);
  } else {
    var ab = mix(a, b, 0.5);
    var ac = mix(a, c, 0.5);
    var bc = mix(b, c, 0.5);

    count -= 1;

    divideTriangle(a, ab, ac, count);
    divideTriangle(c, ac, bc, count);
    divideTriangle(b, bc, ab, count);
  }
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
  points = [];
  requestAnimationFrame(main);
}

function main() {
  canvas = document.getElementById("gl-canvas");
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to init WebGL. Your browser or computer may not support it.");
    return;
  }

  const vertices = [
    [-1, -1],
    [0, 1],
    [1, -1],
  ];
  divideTriangle(vertices[0], vertices[1], vertices[2], numToSubDiv);

  const program = createShaderProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    alert("Failed to create shader!");
    return;
  }
  gl.useProgram(program);

  const arrayBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 50000, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

  const aPosition = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  document.getElementById("recursionDepth").onchange = function (event) {
    numToSubDiv = parseInt(event.target.value);
    document.getElementById("recursionDepthLabel").innerHTML =
      "Recursion Depth: " + numToSubDiv;
  };

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  render();
}

window.onload = main;
