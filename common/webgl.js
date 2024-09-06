function createCanvas(canvasTag) {
  // Setup canvas
  const canvas = document.getElementById(canvasTag);
  if (!canvas) {
    alert(`Unable to find a canvas with the tag '${canvasTag}'.`);
    return null;
  }

  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  return canvas;
}

function initWebGL(canvas) {
  // Initialize WebGL context.
  const gl = canvas.getContext("webgl2");
  if (!gl) {
    alert("Unable to init WebGL. Your browser or computer may not support it.");
    return null;
  }

  // Set the viewport to match the canvas size.
  gl.viewport(0, 0, canvas.width, canvas.height);
  // Set the clear color (background color) to black.
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  return gl;
}
