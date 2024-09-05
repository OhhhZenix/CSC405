"use strict";

const vertexSource = `

`;

const fragmentSource = `

`;

// Renders the triangles onto the canvas using WebGL.
function render(gl) {
  // Clear the canvas.
  gl.clear(gl.COLOR_BUFFER_BIT);
  // Re-render on the next frame.
  requestAnimationFrame(() => render(gl));
}

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

  render(gl);
}

window.onload = main;
