"use strict";

const vertexSource = `# version 300 es

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

in vec4 aPosition;
in vec3 aNormal;

out vec3 vNormal;
out vec3 vPosition;

void main() {
  gl_Position = uProjection * uView * uModel * aPosition;
  vNormal = mat3(transpose(inverse(uModel))) * aNormal;
  vPosition = vec3(uModel * aPosition);
}
`;

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
  float ambientStrength = 0.1;
  vec3 ambient = ambientStrength * uLightColor;

  vec3 norm = normalize(vNormal);
  vec3 lightDir = normalize(uLightPosition - vPosition);  

  float diff = max(dot(norm, lightDir), 0.0);
  vec3 diffuse = diff * uLightColor;

  float specularStrength = 0.5;
  vec3 viewDir = normalize(uViewPosition - vPosition);
  vec3 reflectDir = reflect(-lightDir, norm);  
  float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
  vec3 specular = specularStrength * spec * uLightColor; 

  vec3 result = (ambient + diffuse + specular) * uColor;
  fragColor = vec4(result, 1.0);
}
`;

let vertexData = [];

function resetData() {
  vertexData = [];
}

function triangle(a, b, c) {
  const ab = subtract(b, a);
  const ac = subtract(c, a);
  const normal = normalize(cross(ab, ac));
  vertexData.push(...a, ...normal, ...b, ...normal, ...c, ...normal);
}

function divideTriangle(a, b, c, n) {
  if (n > 0) {
    const ab = normalize(mix(a, b, 0.5), true);
    const ac = normalize(mix(a, c, 0.5), true);
    const bc = normalize(mix(b, c, 0.5), true);

    divideTriangle(a, ab, ac, n - 1);
    divideTriangle(ab, b, bc, n - 1);
    divideTriangle(bc, c, ac, n - 1);
    divideTriangle(ab, bc, ac, n - 1);
  } else {
    triangle(a, b, c);
  }
}

function tetrahedron(n) {
  const a = vec4(0.0, 0.0, -1.0, 1);
  const b = vec4(0.0, 0.942809, 0.3333, 1);
  const c = vec4(-0.816497, -0.471405, 0.3333, 1);
  const d = vec4(0.816497, -0.471405, 0.3333, 1);

  divideTriangle(a, b, c, n);
  divideTriangle(d, c, b, n);
  divideTriangle(a, d, b, n);
  divideTriangle(a, c, d, n);
}

function main() {
  const canvas = initCanvas("gl-canvas");
  const gl = initWebGL(canvas);
  const program = createShaderProgram(gl, vertexSource, fragmentSource);
  gl.useProgram(program);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);

  const sphereColorUi = document.getElementById("sphere-color");
  const outlineColorUi = document.getElementById("outline-color");
  let sphereColor = hexToFloatColor(sphereColorUi.value);
  let outlineColor = hexToFloatColor(outlineColorUi.value);

  sphereColorUi.onchange = (event) => {
    sphereColor = hexToFloatColor(event.target.value);
  };

  outlineColorUi.onchange = (event) => {
    outlineColor = hexToFloatColor(event.target.value);
  };

  const colorLocation = gl.getUniformLocation(program, "uColor");
  const lightColorLocation = gl.getUniformLocation(program, "uLightColor");
  const lightPositionLocation = gl.getUniformLocation(
    program,
    "uLightPosition",
  );
  const viewPositionLocation = gl.getUniformLocation(program, "uViewPosition");

  gl.uniform3fv(lightColorLocation, vec3(1.0, 1.0, 1.0));
  gl.uniform3fv(lightPositionLocation, vec3(-5.0, -5.0, 5.0));
  gl.uniform3fv(viewPositionLocation, vec3(1.0, 1.0, 1.0));

  const smoothnessUi = document.getElementById("smoothness");
  const smoothnessLabelUi = document.getElementById("smoothnessLabel");
  smoothnessLabelUi.innerHTML = smoothnessUi.value;
  tetrahedron(smoothnessUi.value);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);

  const positionLocation = gl.getAttribLocation(program, "aPosition");
  const normalLocation = gl.getAttribLocation(program, "aNormal");

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

  let mouseDown = false;
  let lastX = 0;
  let lastY = 0;
  let angleX = 0;
  let angleY = 0;
  const rotationSpeed = 0.75;

  canvas.addEventListener("mousedown", (event) => {
    mouseDown = true;
    lastX = event.clientX;
    lastY = event.clientY;
  });

  canvas.addEventListener("mouseup", () => {
    mouseDown = false;
  });

  canvas.addEventListener("mousemove", (event) => {
    if (mouseDown) {
      const deltaX = event.clientX - lastX;
      const deltaY = event.clientY - lastY;

      angleX += deltaY * rotationSpeed;
      angleY += deltaX * rotationSpeed;

      lastX = event.clientX;
      lastY = event.clientY;
    }
  });

  let rotationX = mat4();
  let rotationY = mat4();

  function render() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    rotationX = rotate(angleX, vec3(1, 0, 0));
    rotationY = rotate(angleY, vec3(0, 1, 0));
    modelMatrix = mult(rotationX, rotationY);
    gl.uniformMatrix4fv(modelLocation, gl.FALSE, flatten(modelMatrix));

    gl.uniform3fv(colorLocation, sphereColor);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 7);

    gl.uniform3fv(colorLocation, outlineColor);
    for (let i = 0; i < vertexData.length / 7; i += 3) {
      gl.drawArrays(gl.LINE_LOOP, i, 3);
    }

    requestAnimationFrame(render);
  }

  render();
}

window.onload = main;
