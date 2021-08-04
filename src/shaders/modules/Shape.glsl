#define PI 3.14159265359
#define TWO_PI 6.28318530718

float Shape(in vec2 st, in vec2 p, in float size, in float sides, in float blur) {
  vec2 pos = vec2(p) - st;
  float a = atan(pos.x, pos.y) + PI;
  float r = TWO_PI / sides;
  float d = cos(floor(.5 + a/r)*r - a) * length(pos);

  float color = smoothstep(size + blur, size - blur, d);

  return color;
}

#pragma glslify: export(Shape)
