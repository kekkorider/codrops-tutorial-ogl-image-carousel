precision highp float;

uniform float uTime;

varying vec2 vUv;

void main() {
  float sTime = sin(uTime);
  float cTime = cos(uTime);

  vec3 color = vec3(vUv.x*0.8 + sTime*0.2, vUv.y, 0.5 + cTime*0.5);

  gl_FragColor = vec4(color, 1.0);
}
