export const ribbonVertex = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aShade;
layout(location = 3) in vec3 aFront;
layout(location = 4) in vec3 aBack;
layout(location = 5) in float aAlpha;
layout(location = 6) in float aAcross;
uniform mat4 uProjection;
uniform vec3 uCamera;
out vec3 vPosition;
out vec3 vNormal;
out vec2 vShade;
out vec3 vFront;
out vec3 vBack;
out float vAlpha;
out float vAcross;
void main() {
  vPosition = aPosition;
  vNormal = aNormal;
  vShade = aShade;
  vFront = aFront;
  vBack = aBack;
  vAlpha = aAlpha;
  vAcross = aAcross;
  gl_Position = uProjection * vec4(aPosition - uCamera, 1.0);
}`;

export const ribbonFragment = `#version 300 es
precision highp float;
in vec3 vPosition;
in vec3 vNormal;
in vec2 vShade;
in vec3 vFront;
in vec3 vBack;
in float vAlpha;
in float vAcross;
uniform vec3 uCamera;
uniform float uGlow;
out vec4 outColor;

const float PI = 3.14159265;
const vec3 keyDirection = vec3(-0.45, 0.72, 0.53);
const vec3 fillDirection = vec3(0.8, -0.1, 0.58);
const vec3 crestDirection = vec3(0.46, 0.46, 0.76);
const vec3 backDirection = vec3(0.3, 0.6, -0.74);
const vec3 ember = vec3(0.672, 0.01, 0.01);
const vec3 amber = vec3(1.0, 0.35, 0.025);

float ggx(float nh, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float d = nh * nh * (a2 - 1.0) + 1.0;
  return a2 / (PI * d * d);
}

float specular(vec3 n, vec3 v, vec3 l, float roughness) {
  vec3 h = normalize(l + v);
  float nl = max(dot(n, l), 0.0);
  float nv = max(dot(n, v), 1e-3);
  float k = roughness * roughness * 0.5;
  float vis = 0.25 / ((nl * (1.0 - k) + k) * (nv * (1.0 - k) + k));
  float f = 0.04 + 0.96 * pow(1.0 - max(dot(v, h), 0.0), 5.0);
  return ggx(max(dot(n, h), 0.0), roughness) * vis * f * nl;
}

float wrapped(vec3 n, vec3 l, float wrap) {
  float d = max(0.0, (dot(n, l) + wrap) / (1.0 + wrap));
  return d * d;
}

float studio(vec3 r) {
  float softbox = exp(-pow(length(r - normalize(vec3(-0.5, 0.75, 0.45))) * 1.6, 2.0));
  float strip = exp(-pow((r.x - 0.75) * 3.5, 2.0)) * smoothstep(-0.6, 0.3, r.y) * smoothstep(-0.6, 0.0, r.z);
  float sky = smoothstep(-0.2, 0.9, r.y);
  return 0.12 + 0.35 * sky + 1.6 * softbox + 0.6 * strip;
}

vec3 tone(vec3 c) {
  vec3 over = max(c - 0.8, 0.0);
  return min(c, 0.8) + 0.2 * (1.0 - exp(-over / 0.2));
}

void main() {
  bool front = gl_FrontFacing;
  vec3 n = normalize(vNormal) * (front ? 1.0 : -1.0);
  vec3 v = normalize(uCamera - vPosition);
  vec3 albedo = front ? vFront : vBack;
  float occlusion = front ? vShade.x : vShade.y;
  float nv = clamp(dot(n, v), 0.0, 1.0);
  vec3 key = normalize(keyDirection);
  vec3 fill = normalize(fillDirection);
  vec3 rear = normalize(backDirection);
  float edge = smoothstep(0.7, 1.0, abs(vAcross));

  float lit = wrapped(n, key, 0.7) * (1.0 - 0.55 * occlusion) + wrapped(n, fill, 0.5) * 0.3;
  lit += 0.15 * (n.y * 0.5 + 0.5);
  vec3 deep = mix(ember, albedo, 0.25) * 0.8;
  vec3 color = mix(deep, albedo, smoothstep(0.05, 0.85, lit));
  color += amber * pow(clamp(lit, 0.0, 1.0), 5.0) * 0.1 * smoothstep(0.02, 0.2, albedo.g);
  color *= 1.0 - 0.35 * occlusion;

  float thin = pow(1.0 - nv, 3.0);
  float through = pow(max(dot(-n, key), 0.0), 1.5) * 0.08 + pow(max(dot(-n, rear), 0.0), 2.0) * 0.12;
  vec3 glow = mix(albedo, amber, 0.25);
  color += glow * (through + thin * 0.22 + edge * 0.08) * (1.0 - 0.5 * occlusion);
  if (!front) color = mix(color, color * vec3(0.92, 0.55, 0.5), 0.35);

  vec3 sheenTint = mix(vec3(1.0, 0.9, 0.84), albedo, 0.45) + vec3(0.12, 0.06, 0.03);
  vec3 crest = normalize(crestDirection);
  float spec = specular(n, v, key, 0.42) * 0.45 + specular(n, v, crest, 0.11) * 0.75 + specular(n, v, crest, 0.45) * 0.25 + specular(n, v, fill, 0.55) * 0.2;
  color += sheenTint * spec * (1.0 - occlusion);
  float coat = (0.07 + 0.93 * pow(1.0 - nv, 5.0)) * smoothstep(0.0, 0.25, nv);
  color += sheenTint * studio(reflect(-v, n)) * (coat * 0.45 + 0.05) * (1.0 - occlusion);
  color += vec3(1.0, 0.82, 0.66) * pow(1.0 - nv, 7.0) * smoothstep(0.04, 0.12, nv) * 0.35 * (1.0 - occlusion);

  if (!front) color *= 0.9;
  color *= 1.0 + uGlow * 0.03;
  color = tone(color);
  color = pow(color, vec3(1.0 / 2.2));
  outColor = vec4(color * vAlpha, vAlpha);
}`;

export const maskFragment = `#version 300 es
precision highp float;
in float vAlpha;
out vec4 outColor;
void main() {
  outColor = vec4(vAlpha);
}`;

export const screenVertex = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

export const blurFragment = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uStep;
out vec4 outColor;
void main() {
  float sum = texture(uSource, vUv).a * 0.2270;
  sum += (texture(uSource, vUv + uStep * 1.3846).a + texture(uSource, vUv - uStep * 1.3846).a) * 0.3162;
  sum += (texture(uSource, vUv + uStep * 3.2308).a + texture(uSource, vUv - uStep * 3.2308).a) * 0.0703;
  outColor = vec4(sum);
}`;

export const shadowFragment = `#version 300 es
precision highp float;
in vec2 vUv;
uniform sampler2D uSource;
uniform vec2 uOffset;
uniform vec4 uTint;
out vec4 outColor;
void main() {
  float a = texture(uSource, vUv - uOffset).a * uTint.a;
  outColor = vec4(uTint.rgb * a, a);
}`;
