precision highp float;

uniform float uProgress;
uniform vec2 uResolution;
uniform vec2 uGridSize;
uniform sampler2D uTexture0;
uniform vec2 uTexture0Size;
uniform sampler2D uTexture1;
uniform vec2 uTexture1Size;

varying vec2 vUv;

#pragma glslify: Shape = require(./modules/Shape)
#pragma glslify: Rotate = require(./modules/Rotate)
#pragma glslify: Cover = require(./modules/Cover)
#pragma glslify: Random = require(./modules/Random)

float Triangle(vec2 uv, vec2 position, float size) {
  float sides = 3.0;
  float blur = 0.001;

  return Shape(uv, position, size, sides, blur);
}

float Tiles(vec2 uv, float progress) {
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

      // Offset each triangle by a value that goes from -1.0 to +1.0
      float randomOffsetX = Random(triangleID.y);
      randomOffsetX = (randomOffsetX - 0.5) * 2.0;

      float randomOffsetY = Random(triangleID.x);
      randomOffsetY = (randomOffsetY - 0.5) * 2.0;

      vec2 randomOffset = vec2(randomOffsetX, randomOffsetY)*0.1;

      // Determine if the current triangle can be drawn or not
      float isVisible = step(abs(triangleID.x), uGridSize.x);
      isVisible *= step(abs(triangleID.y), uGridSize.y);

      // Set the alpha value of each triangle using the `progress` parameter
      float fadeStart = clamp(Random(triangleID), 0.1, 0.9);
      float alpha = smoothstep(fadeStart, 0., progress);

      // Determine the size of each triangle using the `progress` parameter
      float sizeFactor = min(Random(triangleID), 0.3);

      // Get the normalized distance of the current triangle from the center of the
      // screen to add it to the scale of the triangle.
      float dist = distance(vec2(0.0), triangleID) / max(uGridSize.x, uGridSize.y);
      dist *= 0.15;

      float size = mix(0.26, 0.9, progress*sizeFactor)+dist;

      // Apply a random rotation between -PI and +PI to each triangle
      mat2 triangleRandomRotation = Rotate(PI*(Random(triangleID) - 0.5)*2.0);

      /*
       * Draw the triangles pointing down
       */
      vec2 rotatedGV = (gv - vec2(0.0, 0.4) - tileOffset - tileShift - randomOffset - 0.5)*triangleRandomRotation + 0.5;
      float d = Triangle(rotatedGV, vec2(0.5), size);
      d *= isVisible;
      d *= alpha;

      /*
       * Draw the triangles pointing up
       */

      // Create a new set of UVs named `st` and rotate them around their center
      vec2 st = (gv - tileOffset - tileShift - randomOffset)*triangleRandomRotation + 0.5;

      // Add the triangle
      float u = Triangle(st, vec2(0.5, 0.4), size);
      u *= isVisible;
      u *= alpha;

      result += d+u;
    }
  }

  // Create a mask of the size of the grid that is used to display the full image
  float fullImageMask = step(abs(id.x) + 0.5, uGridSize.x);
  fullImageMask *= step(abs(id.y), uGridSize.y);

  // "Mask" it with the value of the triangles' grid.
  // This basically creates holes in the mask.
  // This step is needed because we will add this mask with the triangles, otherwise
  // The final result would have areas much more luminous than the normal.
  fullImageMask *= 1.0 - result;

  // Set the alpha value of this mask using the `progress` parameter.
  fullImageMask *= smoothstep(0.45, 0.1, abs(progress));

  result += fullImageMask;

  return result;
}

void main() {
  // UV coordinates that go from -1 to +1,
  // useful to easily align things at the center of the screen.
  vec2 uv = vUv*2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 color = vec3(0.0);

  // Animation progress for the image's mask
  float progress0 = smoothstep(0.15, 0.85, uProgress); // [0 .. 1]
  float progress1 = smoothstep(0.25, 0.95, uProgress) - 1.0; // [-1 .. 0]

  // Create the masks with the triangles
  float mask0 = Tiles(uv, progress0);
  float mask1 = Tiles(uv, progress1);

  // Create the textures
  vec2 coverUV = Cover(vUv, uResolution, uTexture0Size);
  vec4 tex0 = texture2D(uTexture0, coverUV);

  coverUV = Cover(vUv, uResolution, uTexture1Size);
  vec4 tex1 = texture2D(uTexture1, coverUV);

  // "Layers" are just the textures with the masks applied
  vec3 layer0 = tex0.rgb*mask0;
  vec3 layer1 = tex1.rgb*mask1;

  // Display one texture or the other based on the value of `uProgress`
  color = mix(layer0, layer1, smoothstep(0.5, 0.85, uProgress));

  gl_FragColor = vec4(color, 1.0);
}
