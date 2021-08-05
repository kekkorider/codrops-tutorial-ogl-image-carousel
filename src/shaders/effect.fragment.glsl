precision highp float;

uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uGridSize;
uniform sampler2D uTexture0;
uniform vec2 uTexture0Size;

varying vec2 vUv;

#pragma glslify: Shape = require(./modules/Shape)
#pragma glslify: Rotate = require(./modules/Rotate)
#pragma glslify: Cover = require(./modules/Cover)

float Triangle(vec2 uv, vec2 position) {
  float size = 0.2;
  float sides = 3.0;
  float blur = 0.001;

  return Shape(uv, position, size, sides, blur);
}

float Tiles(vec2 uv) {
  float result = 0.0;

  // This makes the UVs repeat infinitely on both axes
  // depending on how many times the UVs are multiplied,
  // creating the illusion of a grid.
  // "gv" stands for "grid UV".
  vec2 gv = fract(uv*5.0 + 0.25);

  // Get a unique identifier for each tile
  vec2 id = floor(uv*5.0 + 0.25);

  // For each tile, loop through its neighbor tiles (+ itself) and
  // draw a triangle in each one of them.
  // This gives the illusion that what's drawn goes past the boundaries.
  for (float y = -1.0; y <= 1.0; y++) {
    for (float x = -1.0; x <= 1.0; x++) {
      // Get the coordinates of the neighbor tile
      vec2 tileOffset = vec2(x, y);

      // Get a unique identifier of each triangle
      vec2 triangleID = id + tileOffset;

      // Shift the tile by half of its width on even rows
      vec2 tileShift = vec2(mod(triangleID.y, 2.0)*0.5, 0.0);

      // Determine if the current triangle can be drawn or not
      float isVisible = step(abs(triangleID.x), uGridSize.x);
      isVisible *= step(abs(triangleID.y), uGridSize.y);

      /*
       * Draw the triangles pointing down
       */
      float d = Triangle(gv - tileOffset - tileShift, vec2(0.5));
      d *= isVisible;

      /*
       * Draw the triangles pointing up
       */

      // Create a new set of UVs named `st` and rotate them around their center
      vec2 st = (gv - tileOffset - tileShift)*Rotate(PI) + 0.5;

      // Add the triangle
      float u = Triangle(st, vec2(0.5, 0.4));
      u *= isVisible;

      result += d+u;
    }
  }

  return result;
}

void main() {
  // UV coordinates that go from -1 to +1,
  // useful to easily align things at the center of the screen.
  vec2 uv = vUv*2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 color = vec3(0.0);

  color += Tiles(uv);

  vec2 coverUV = Cover(vUv, uResolution, uTexture0Size);
  vec4 tex0 = texture2D(uTexture0, coverUV);

  gl_FragColor = vec4(tex0.rgb, 1.0);
}
