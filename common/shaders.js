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
