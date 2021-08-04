precision highp float;

uniform float uProgress;

varying vec2 vUv;

void main() {
  vec3 color = vec3(vUv, uProgress);

  gl_FragColor = vec4(color, 1.0);
}
