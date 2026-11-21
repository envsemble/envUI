type Vector = [number, number, number];

interface Knot {
  at: Vector;
  lean: number;
  twist: number;
  pivot: number;
  halfWidth: number;
  front: string;
  back: string;
}

const knot = (
  at: Vector,
  [lean, twist, pivot]: Vector,
  width: number,
  front: string,
  back: string,
): Knot => ({ at, lean, twist, pivot, halfWidth: width / 2, front, back });

export const curlReach = 0.32;
export const crestClearance = 0.47;

const knots: Knot[] = [
  knot([-1.5, -0.42, 0.12], [0.2, -0.3, 0], 0.25, '#F27A20', '#D8401A'),
  knot([-1.22, -0.2, 0.08], [0.2, -0.35, 0], 0.25, '#F58020', '#D8401A'),
  knot([-0.98, 0, 0.04], [0.25, -0.4, 0], 0.25, '#F88A24', '#D03418'),
  knot([-0.74, 0.15, 0], [0.3, -0.35, 0], 0.245, '#FB9028', '#CC3018'),
  knot([-0.5, 0.25, -0.04], [0.35, -0.25, 0], 0.24, '#F67424', '#C41A18'),
  knot([-0.28, 0.31, -0.08], [0.4, -0.15, 0], 0.235, '#E8481C', '#BC1418'),
  knot([-0.08, 0.32, -0.1], [0.45, -0.3, 0], 0.23, '#D2201A', '#B41218'),
  knot([0.08, 0.27, -0.1], [0.45, -0.6, 0], 0.225, '#C4141A', '#B01218'),
  knot([0.17, 0.16, -0.08], [0.4, -1.0, 0], 0.225, '#C2141A', '#B4141A'),
  knot([0.19, 0.02, -0.05], [0.35, -1.45, 0], 0.23, '#C8181A', '#BA1818'),
  knot([0.17, -0.16, -0.02], [0.3, -1.9, 0], 0.24, '#D02418', '#C22018'),
  knot([0.11, -0.34, 0.02], [0.3, -2.3, 0], 0.25, '#D83218', '#CC2818'),
  knot([0.02, -0.5, 0.06], [0.3, -2.65, 0], 0.25, '#DE4018', '#D63A18'),
  knot([-0.13, -0.66, 0.1], [0.3, -2.9, 0], 0.25, '#E44A1A', '#DE4A1A'),
  knot([-0.36, -0.8, 0.14], [0.3, -3.05, 0], 0.25, '#E85420', '#E4521C'),
];

const samplesAlong = 480;
const samplesAcross = 9;
export const vertexCount = samplesAlong * samplesAcross;
export const dynamicFloats = 8;
export const staticFloats = 8;

const cushion = 0.34;

function linear(hex: string): Vector {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => (c / 255) ** 2.2) as Vector;
}

const knotColors = knots.map((k) => ({ front: linear(k.front), back: linear(k.back) }));

function catmull(a: number, b: number, c: number, d: number, t: number) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3)
  );
}

function sampleKnots(u: number, pick: (k: Knot) => number) {
  const spans = knots.length - 1;
  const s = Math.min(spans - 1e-6, Math.max(0, u * spans));
  const i = Math.floor(s);
  const at = (j: number) => knots[Math.min(spans, Math.max(0, j))]!;
  return catmull(pick(at(i - 1)), pick(at(i)), pick(at(i + 1)), pick(at(i + 2)), s - i);
}

function smoothColor(u: number, side: 'front' | 'back'): Vector {
  const spans = knots.length - 1;
  const s = Math.min(spans - 1e-6, u * spans);
  const i = Math.floor(s);
  const f = s - i;
  const e = f * f * (3 - 2 * f);
  const a = knotColors[i]![side];
  const b = knotColors[i + 1]![side];
  return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e];
}

function normalize(v: Vector): Vector {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

const cross = (a: Vector, b: Vector): Vector => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function ribbonIndices() {
  const indices = new Uint16Array((samplesAlong - 1) * (samplesAcross - 1) * 6);
  let o = 0;
  for (let i = 0; i < samplesAlong - 1; i++)
    for (let j = 0; j < samplesAcross - 1; j++) {
      const a = i * samplesAcross + j;
      const b = a + samplesAcross;
      indices.set([a, b, a + 1, a + 1, b, b + 1], o);
      o += 6;
    }
  return indices;
}

export function ribbonStatic() {
  const out = new Float32Array(vertexCount * staticFloats);
  let o = 0;
  for (let i = 0; i < samplesAlong; i++) {
    const u = i / (samplesAlong - 1);
    const front = smoothColor(u, 'front');
    const back = smoothColor(u, 'back');
    for (let j = 0; j < samplesAcross; j++) {
      const v = (j / (samplesAcross - 1)) * 2 - 1;
      out.set([...front, ...back, 1, v], o);
      o += staticFloats;
    }
  }
  return out;
}

const centre = new Float32Array(samplesAlong * 3);
const rest = Array.from({ length: samplesAlong }, (_, i) => {
  const u = i / (samplesAlong - 1);
  return {
    x: sampleKnots(u, (k) => k.at[0]),
    y: sampleKnots(u, (k) => k.at[1]),
    z: sampleKnots(u, (k) => k.at[2]),
    lean: sampleKnots(u, (k) => k.lean),
    twist: sampleKnots(u, (k) => k.twist),
    half: sampleKnots(u, (k) => k.halfWidth),
    pivot: sampleKnots(u, (k) => k.pivot),
  };
});
const middle = new Float32Array(samplesAlong * 3);
const frames = new Float32Array(samplesAlong * 7);
const shade = new Float32Array(samplesAlong * 2);
const occluderStep = 8;
const occluderGap = 40;
const occluderReach = 0.3;
const occlusionStrength = 0.09;
const reachLimit = (occluderReach * 3) ** 2;

function occlude() {
  for (let i = 0; i < samplesAlong; i++) {
    let front = 0;
    let back = 0;
    const nx = frames[i * 7 + 3]!;
    const ny = frames[i * 7 + 4]!;
    const nz = frames[i * 7 + 5]!;
    for (let j = 0; j < samplesAlong; j += occluderStep) {
      if (Math.abs(i - j) < occluderGap) continue;
      const dx = middle[j * 3]! - middle[i * 3]!;
      const dy = middle[j * 3 + 1]! - middle[i * 3 + 1]!;
      const dz = middle[j * 3 + 2]! - middle[i * 3 + 2]!;
      const squared = dx * dx + dy * dy + dz * dz;
      if (squared > reachLimit) continue;
      const facing = (dx * nx + dy * ny + dz * nz) / Math.sqrt(squared || 1);
      const weight = Math.exp(-squared / (occluderReach * occluderReach));
      if (facing > 0) front += facing * weight;
      else back -= facing * weight;
    }
    shade[i * 2] = 1 - Math.exp(-front * occlusionStrength * occluderStep);
    shade[i * 2 + 1] = 1 - Math.exp(-back * occlusionStrength * occluderStep);
  }
}

export function ribbonPose(out: Float32Array, time: number) {
  for (let i = 0; i < samplesAlong; i++) {
    const u = i / (samplesAlong - 1);
    const sway = 0.012 * Math.sin(time * 0.35) * Math.cos(u * 4.2 + time * 0.2);
    const at = rest[i]!;
    centre[i * 3] = at.x;
    centre[i * 3 + 1] = at.y + sway;
    centre[i * 3 + 2] = at.z + sway * 2;
  }
  for (let i = 0; i < samplesAlong; i++) {
    const u = i / (samplesAlong - 1);
    const i0 = Math.max(0, i - 1);
    const i1 = Math.min(samplesAlong - 1, i + 1);
    const tangent = normalize([
      centre[i1 * 3]! - centre[i0 * 3]!,
      centre[i1 * 3 + 1]! - centre[i0 * 3 + 1]!,
      centre[i1 * 3 + 2]! - centre[i0 * 3 + 2]!,
    ]);
    const { lean, half, pivot } = rest[i]!;
    const flat = Math.hypot(tangent[0], tangent[1]) || 1;
    const reference: Vector = [
      (-tangent[1] / flat) * Math.cos(lean),
      (tangent[0] / flat) * Math.cos(lean),
      Math.sin(lean),
    ];
    const along = reference[0] * tangent[0] + reference[1] * tangent[1] + reference[2] * tangent[2];
    const base = normalize([
      reference[0] - tangent[0] * along,
      reference[1] - tangent[1] * along,
      reference[2] - tangent[2] * along,
    ]);
    const baseNormal = cross(tangent, base);
    const twist = rest[i]!.twist + 0.14 * Math.sin(time * 0.27) * Math.sin(u * 5.3 + time * 0.11);
    const c = Math.cos(twist);
    const s = Math.sin(twist);
    const across: Vector = [
      base[0] * c + baseNormal[0] * s,
      base[1] * c + baseNormal[1] * s,
      base[2] * c + baseNormal[2] * s,
    ];
    const normal = cross(tangent, across);
    for (let axis = 0; axis < 3; axis++) {
      const anchor = centre[i * 3 + axis]! + base[axis]! * half * pivot;
      middle[i * 3 + axis] = anchor - across[axis]! * half * pivot;
      frames[i * 7 + axis] = across[axis]!;
      frames[i * 7 + 3 + axis] = normal[axis]!;
    }
    frames[i * 7 + 6] = half;
  }
  occlude();
  let o = 0;
  for (let i = 0; i < samplesAlong; i++) {
    const half = frames[i * 7 + 6]!;
    for (let j = 0; j < samplesAcross; j++) {
      const v = (j / (samplesAcross - 1)) * 2 - 1;
      for (let axis = 0; axis < 3; axis++)
        out[o++] = middle[i * 3 + axis]! + frames[i * 7 + axis]! * half * v;
      const nx = frames[i * 7 + 3]! + frames[i * 7]! * v * cushion;
      const ny = frames[i * 7 + 4]! + frames[i * 7 + 1]! * v * cushion;
      const nz = frames[i * 7 + 5]! + frames[i * 7 + 2]! * v * cushion;
      const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      out[o++] = nx / length;
      out[o++] = ny / length;
      out[o++] = nz / length;
      out[o++] = shade[i * 2]!;
      out[o++] = shade[i * 2 + 1]!;
    }
  }
  return out;
}
