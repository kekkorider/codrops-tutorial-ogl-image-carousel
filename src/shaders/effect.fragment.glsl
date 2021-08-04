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

  // This makes the UVs repeat infinitely on both axes
  // depending on how many times the UVs are multiplied,
  // creating the illusion of a grid.
  // "gv" stands for "grid UV".
  vec2 gv = fract(uv*5.0);

  vec2 pos = vec2(0.5);
  float size = 0.2;
  float sides = 3.0;
  float blur = 0.001;
  float triangle = Shape(gv, pos, size, sides, blur);

  color += triangle;

  // Debug axes
  float pixel = 1.0 / uResolution.x;
  color.r += 1.0 - step(pixel*4.0, abs(uv.x));
  color.r += 1.0 - step(pixel*4.0, abs(uv.y));

  gl_FragColor = vec4(color, 1.0);
}
