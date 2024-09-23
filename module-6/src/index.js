"use strict";

// Vertex Shader Source Code
const vertexSource = `# version 300 es

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

in vec4 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vPosition;

void main() {
  // Calculate the final position of the vertex
  gl_Position = uProjection * uView * uModel * aPosition;
  // Transform normal to world space
  vNormal = mat3(transpose(inverse(uModel))) * aNormal;
  // Get the position in world space
  vPosition = vec3(uModel * aPosition);
}
`;

// Fragment Shader Source Code
const fragmentSource = `# version 300 es
precision highp float;

uniform vec3 uColor;
uniform vec3 uLightColor; 
uniform vec3 uLightPosition; 
uniform vec3 uViewPosition;

in vec3 vNormal;  
in vec3 vPosition;

out vec4 fragColor;

void main() {
  // Ambient lighting calculation
  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * uLightColor;


  // Normalize the normal and calculate the light direction
  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(uLightPosition - vPosition);  

  // Diffuse lighting calculation
  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * uLightColor;

  // Specular lighting calculation
  float specularStrength = 0.5;
  vec3 viewDir = normalize(uViewPosition - vPosition);
  vec3 reflectDir = reflect(-lightDir, norm);  
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = specularStrength * spec * uLightColor; 
  
  // Combine the results to get the final color
  vec3 result = (ambient + diffuse + specular) * uColor;

  // Set the output color with full opacity
  fragColor = vec4(result, 1.0);
}
`;

// Array to store vertex data
let vertexData = [];

// Function to reset vertex data
function resetData() {
  vertexData = [];
}

// Function to define a triangle with vertices a, b, and c
function triangle(a, b, c) {
  // Vector from a to b
  const ab = subtract(b, a);
  // Vector from a to c
  const ac = subtract(c, a);
  // Calculate the normal vector
  const normal = normalize(cross(ab, ac));
  // Push vertex positions and normals into vertexData
  vertexData.push(...a, ...normal, ...b, ...normal, ...c, ...normal);
}

// Function to recursively divide a triangle
function divideTriangle(a, b, c, n) {
  if (n > 0) {
    // Midpoints of the edges
    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    // Recursively divide the triangle
    divideTriangle(a, ab, ac, n - 1);
    divideTriangle(ab, b, bc, n - 1);
    divideTriangle(bc, c, ac, n - 1);
    divideTriangle(ab, bc, ac, n - 1);
  } else {
    // Base case: draw the triangle
    triangle(a, b, c);
  }
}

// Function to create a tetrahedron
function tetrahedron(n) {
  const a = vec4(0.0, 0.0, -1.0, 1);
  const b = vec4(0.0, 0.942809, 0.3333, 1);
  const c = vec4(-0.816497, -0.471405, 0.3333, 1);
  const d = vec4(0.816497, -0.471405, 0.3333, 1);

  // Divide the tetrahedron's faces
  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

// Main function to set up the WebGL context and render
function main() {
  // Initialize the canvas
  const canvas = initCanvas("gl-canvas");
  // Initialize WebGL context
  const gl = initWebGL(canvas);
  // Create shader program
  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  // Use the created program
  gl.useProgram(program);

  // Enable depth testing
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  // UI elements for color selection
  const sphereColorUi = document.getElementById("sphere-color");
  const outlineColorUi = document.getElementById("outline-color");
  let sphereColor = hexToFloatColor(sphereColorUi.value);
  let outlineColor = hexToFloatColor(outlineColorUi.value);

  // Update sphere color on UI change
  sphereColorUi.onchange = (event) => {
    sphereColor = hexToFloatColor(event.target.value);
  };

  // Update outline color on UI change
  outlineColorUi.onchange = (event) => {
    outlineColor = hexToFloatColor(event.target.value);
  };

  // Get uniform locations for the shader program
  const colorLocation = gl.getUniformLocation(program, "uColor");
  const lightColorLocation = gl.getUniformLocation(program, "uLightColor");
  const lightPositionLocation = gl.getUniformLocation(
    program,
    "uLightPosition",
  );
  const viewPositionLocation = gl.getUniformLocation(program, "uViewPosition");

  // Set initial light properties
  gl.uniform3fv(lightColorLocation, vec3(1.0, 1.0, 1.0));
  gl.uniform3fv(lightPositionLocation, vec3(-5.0, -5.0, 5.0));
  gl.uniform3fv(viewPositionLocation, vec3(1.0, 1.0, 1.0));

  // UI for smoothness adjustment
  const smoothnessUi = document.getElementById("smoothness");
  const smoothnessLabelUi = document.getElementById("smoothnessLabel");
  smoothnessLabelUi.innerHTML = smoothnessUi.value;

  // Create the tetrahedron with the initial smoothness
  tetrahedron(smoothnessUi.value);

  // Create and bind a buffer for vertex data
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  // Get attribute locations for vertex positions and normals
  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const normalLocation = gl.getAttribLocation(program, "aNormal");

  // Set up vertex attribute pointers
  gl.vertexAttribPointer(
    positionLocation,
    4,
    gl.FLOAT,
    false,
    7 * Float32Array.BYTES_PER_ELEMENT,
    0,
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(
    normalLocation,
    3,
    gl.FLOAT,
    false,
    7 * Float32Array.BYTES_PER_ELEMENT,
    4 * Float32Array.BYTES_PER_ELEMENT,
  );
  gl.enableVertexAttribArray(normalLocation);

  // Update tetrahedron when smoothness changes
  smoothnessUi.onchange = (event) => {
    const value = event.target.value;
    smoothnessLabelUi.innerHTML = value;
    resetData();
    tetrahedron(value);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW,
    );
  };

  // Get uniform locations for MVP matrices
  const modelLocation = gl.getUniformLocation(program, "uModel");
  const viewLocation = gl.getUniformLocation(program, "uView");
  const projectionLocation = gl.getUniformLocation(program, "uProjection");

  // Initialize matrices for MVP
  let modelMatrix = mat4();
  const viewMatrix = lookAt(vec3(0, 0, -5), vec3(0, 0, 0), vec3(0, 1, 0));
  const projectionMatrix = perspective(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000.0,
  );

  // Set uniform matrices for MVP
  gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));
  gl.uniformMatrix4fv(viewLocation, gl.FALSE, flatten(viewMatrix));
  gl.uniformMatrix4fv(projectionLocation, gl.FALSE, flatten(projectionMatrix));

  // Variables for mouse interaction
  let mouseDown = false;
  let lastX = 0;
  let lastY = 0;
  let angleX = 0;
  let angleY = 0;
  const rotationSpeed = 0.75; // Speed of rotation for mouse drag

  // Event listener for mouse down (to start rotation)
  canvas.addEventListener("mousedown", (event) => {
    // Start tracking mouse interaction
    mouseDown = true;
    // Store the last x-coordinate
    lastX = event.clientX;
    // Store the last y-coordinate
    lastY = event.clientY;
  });

  // Event listener for mouse up (to stop rotation)
  canvas.addEventListener("mouseup", () => {
    // Stop rotation when the mouse is released
    mouseDown = false;
  });

  // Event listener for mouse movement (to update rotation angles)
  canvas.addEventListener("mousemove", (event) => {
    if (mouseDown) {
      // Change in x
      const deltaX = event.clientX - lastX;
      // Change in y
      const deltaY = event.clientY - lastY;

      // Update X angle
      angleX += deltaY * rotationSpeed;
      // Update Y angle
      angleY += deltaX * rotationSpeed;

      // Update last x-coordinate
      lastX = event.clientX;
      // Update last y-coordinate
      lastY = event.clientY;
    }
  });

  // Initialize rotation matrix for X-axis
  let rotationX = mat4();
  // Initialize rotation matrix for Y-axis
  let rotationY = mat4();

  // Render function to draw the scene
  function render() {
    // Set viewport
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Clear the screen and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rotation around X-axis
    rotationX = rotate(angleX, vec3(1, 0, 0));
    // Rotation around Y-axis
    rotationY = rotate(angleY, vec3(0, 1, 0));
    // Combine rotations
    modelMatrix = mult(rotationX, rotationY);
    // Update model matrix in shader
    gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));

    // Set the sphere color
    gl.uniform3fv(colorLocation, sphereColor);
    // Draw the tetrahedron
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 7);

    // Set the outline color
    gl.uniform3fv(colorLocation, outlineColor);
    for (let i = 0; i < vertexData.length / 7; i += 3) {
      // Draw each triangle outline
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }

    requestAnimationFrame(render); // Request the next frame for animation
  }

  // Start the rendering process
  render();
}

// Starts the application when the window loads
window.onload = main;
