mat2 Rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);

  return mat2(c, -s, s, c);
}

#pragma glslify: export(Rotate)
