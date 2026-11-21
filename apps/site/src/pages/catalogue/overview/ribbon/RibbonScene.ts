import {
  crestClearance,
  curlReach,
  dynamicFloats,
  ribbonIndices,
  ribbonPose,
  ribbonStatic,
  staticFloats,
  vertexCount,
} from './RibbonMesh';
import {
  blurFragment,
  maskFragment,
  ribbonFragment,
  ribbonVertex,
  screenVertex,
  shadowFragment,
} from './RibbonShaders';

export interface RibbonFrame {
  width: number;
  height: number;
  cornerX: number;
  cornerY: number;
  unit: number;
  placed?: boolean;
  roll?: number;
}

export interface RibbonView {
  draw: (frame: RibbonFrame, dpr: number, dark: boolean, time: number) => void;
  dispose: () => void;
}

const cameraDistance = 4;
const nearPlane = 0.5;
const farPlane = 12;
const shadowScale = 0.25;
const blurPasses = 2;

function compile(gl: WebGL2RenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(shader) ?? 'The ribbon shader did not compile.');
    gl.attachShader(program, shader);
    gl.deleteShader(shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(program) ?? 'The ribbon shaders did not link.');
  return program;
}

const cameraX = -1;
const cameraY = -0.5;

function rolled(projection: Float32Array, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const shiftX = c * cameraX - s * cameraY - cameraX;
  const shiftY = s * cameraX + c * cameraY - cameraY;
  const turn = [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
  const out = new Float32Array(16);
  for (let column = 0; column < 4; column++)
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += projection[k * 4 + row]! * turn[column * 4 + k]!;
      out[column * 4 + row] = sum;
    }
  return out;
}

function frustum(frame: RibbonFrame) {
  const projection = upright(frame);
  return frame.roll ? rolled(projection, frame.roll) : projection;
}

function upright({ width, height, cornerX, cornerY, unit: widgetUnit, placed }: RibbonFrame) {
  const unit = placed
    ? widgetUnit
    : widgetUnit * Math.min(1, cornerY / widgetUnit / crestClearance);
  const anchorX = placed ? cornerX : Math.min(cornerX, width - curlReach * unit);
  const k = nearPlane / cameraDistance;
  const left = (-anchorX / unit - cameraX) * k;
  const right = ((width - anchorX) / unit - cameraX) * k;
  const bottom = (-(height - cornerY) / unit - cameraY) * k;
  const top = (cornerY / unit - cameraY) * k;
  return new Float32Array([
    (2 * nearPlane) / (right - left),
    0,
    0,
    0,
    0,
    (2 * nearPlane) / (top - bottom),
    0,
    0,
    (right + left) / (right - left),
    (top + bottom) / (top - bottom),
    -(farPlane + nearPlane) / (farPlane - nearPlane),
    -1,
    0,
    0,
    (-2 * farPlane * nearPlane) / (farPlane - nearPlane),
    0,
  ]);
}

function target(gl: WebGL2RenderingContext) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const framebuffer = gl.createFramebuffer();
  return { texture, framebuffer, width: 0, height: 0 };
}

export function createRibbonView(canvas: HTMLCanvasElement): RibbonView | null {
  const gl = canvas.getContext('webgl2', {
    antialias: true,
    alpha: true,
    premultipliedAlpha: true,
    depth: true,
    powerPreference: 'low-power',
  });
  if (!gl) return null;

  const ribbon = compile(gl, ribbonVertex, ribbonFragment);
  const mask = compile(gl, ribbonVertex, maskFragment);
  const blur = compile(gl, screenVertex, blurFragment);
  const shadow = compile(gl, screenVertex, shadowFragment);
  const uniform = (program: WebGLProgram, name: string) => gl.getUniformLocation(program, name);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const pose = new Float32Array(vertexCount * dynamicFloats);
  const poseBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, poseBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, pose.byteLength, gl.DYNAMIC_DRAW);
  for (const [location, size, offset] of [
    [0, 3, 0],
    [1, 3, 3],
    [2, 2, 6],
  ] as const) {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, dynamicFloats * 4, offset * 4);
  }
  const staticBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, staticBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, ribbonStatic(), gl.STATIC_DRAW);
  for (const [location, size, offset] of [
    [3, 3, 0],
    [4, 3, 3],
    [5, 1, 6],
    [6, 1, 7],
  ] as const) {
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, staticFloats * 4, offset * 4);
  }
  const indices = ribbonIndices();
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  const screen = gl.createVertexArray();
  const targets = [target(gl), target(gl)] as const;
  let posedAt = Number.NaN;

  const resizeTargets = (width: number, height: number) => {
    for (const t of targets) {
      if (t.width === width && t.height === height) continue;
      t.width = width;
      t.height = height;
      gl.bindTexture(gl.TEXTURE_2D, t.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, t.framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t.texture, 0);
    }
  };

  const drawRibbon = (program: WebGLProgram, projection: Float32Array) => {
    gl.useProgram(program);
    gl.uniformMatrix4fv(uniform(program, 'uProjection'), false, projection);
    gl.uniform3f(uniform(program, 'uCamera'), cameraX, cameraY, cameraDistance);
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
  };

  return {
    draw(frame, dpr, dark, time) {
      const { width, height } = frame;
      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      if (posedAt !== time) {
        ribbonPose(pose, time);
        gl.bindBuffer(gl.ARRAY_BUFFER, poseBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, pose);
        posedAt = time;
      }
      const projection = frustum(frame);

      const shadowWidth = Math.max(1, Math.round(pixelWidth * shadowScale));
      const shadowHeight = Math.max(1, Math.round(pixelHeight * shadowScale));
      resizeTargets(shadowWidth, shadowHeight);
      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.disable(gl.CULL_FACE);
      gl.bindFramebuffer(gl.FRAMEBUFFER, targets[0].framebuffer);
      gl.viewport(0, 0, shadowWidth, shadowHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      drawRibbon(mask, projection);

      gl.useProgram(blur);
      gl.bindVertexArray(screen);
      const spread = (dark ? 1.4 : 0.7) * dpr;
      for (let pass = 0; pass < blurPasses * 2; pass++) {
        const from = targets[pass % 2];
        const to = targets[(pass + 1) % 2];
        gl.bindFramebuffer(gl.FRAMEBUFFER, to.framebuffer);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, from.texture);
        gl.uniform1i(uniform(blur, 'uSource'), 0);
        const horizontal = pass % 2 === 0;
        const reach = spread * (1 + Math.floor(pass / 2));
        gl.uniform2f(
          uniform(blur, 'uStep'),
          horizontal ? reach / shadowWidth : 0,
          horizontal ? 0 : reach / shadowHeight,
        );
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, pixelWidth, pixelHeight);
      gl.clearColor(0, 0, 0, 0);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(shadow);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[0].texture);
      gl.uniform1i(uniform(shadow, 'uSource'), 0);
      gl.uniform2f(uniform(shadow, 'uOffset'), 0, dark ? 0 : (-6 * dpr) / pixelHeight);
      if (dark) gl.uniform4f(uniform(shadow, 'uTint'), 0.9, 0.24, 0.06, 0.1);
      else gl.uniform4f(uniform(shadow, 'uTint'), 0.8, 0.3, 0.1, 0.05);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LESS);
      gl.useProgram(ribbon);
      gl.uniform1f(uniform(ribbon, 'uGlow'), dark ? 1 : 0);
      drawRibbon(ribbon, projection);
    },
    dispose() {
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    },
  };
}
