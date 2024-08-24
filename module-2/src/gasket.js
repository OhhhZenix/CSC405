"use strict";

const vertexShader = `
attribute vec2 aPosition;
uniform mat4 uTransform;

void main() {
	gl_Position = uTransform * vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShader = `
precision mediump float;

void main() {
	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
}
`;

function compileShader(gl, source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation failed:", gl.getShaderInfoLog(shader));
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
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

function main() {
  const canvas = document.getElementById("gl-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext("webgl");
  if (!gl) {
    alert("Unable to init WebGL. Your browser or computer may not support it.");
    return;
  }

  const program = createShaderProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    alert("Failed to compile shader!");
    return;
  }

  gl.useProgram(program);

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

main();
