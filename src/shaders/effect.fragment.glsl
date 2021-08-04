precision highp float;

uniform float uProgress;
uniform vec2 uResolution;

varying vec2 vUv;

#pragma glslify: Shape = require(./modules/Shape)

void main() {
  // UV coordinates that go from -1 to +1,
  // useful to easily align things at the center of the screen.
  vec2 uv = vUv*2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 color = vec3(0.0);

  vec2 pos = vec2(0.0);
  float size = 0.1;
  float sides = 3.0;
  float blur = 0.001;
  float triangle = Shape(uv, pos, size, sides, blur);

  color += triangle;

  gl_FragColor = vec4(color, 1.0);
}
