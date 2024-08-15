"use strict";

function main() {
  const canvas = document.getElementById("gl-canvas");
  const gl = canvas.getContext("webgl");

  if (!gl) {
    alert("Unable to init WebGL. Your browser or computer may not support it.");
    return;
  }

  // const shaderProgram = initShaders(
  //   gl,
  //   "../assets/vertex.glsl",
  //   "../assets/fragment.glsl",
  // );

  // console.log(shaderProgram);

  gl.clearColor(0.0, 0.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

main();
