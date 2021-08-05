float Random(float n) {
  return fract(sin(n) * 43758.5453123);
}

float Random(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p+45.32);
  return fract(p.x * p.y);
}

#pragma glslify: export(Random)
