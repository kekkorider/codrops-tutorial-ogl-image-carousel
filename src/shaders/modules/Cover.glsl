// Stolen from https://gist.github.com/statico/df64c5d167362ecf7b34fca0b1459a44
vec2 Cover(vec2 uv, vec2 screenSize, vec2 imageSize) {
  vec2 s = screenSize;
  vec2 i = imageSize;

  float rs = s.x / s.y;
  float ri = i.x / i.y;

  vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
  vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
  vec2 st = uv * s / new + offset;

  return st;
}

#pragma glslify: export(Cover)
