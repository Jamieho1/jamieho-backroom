/** Original, procedural London study. No external models, textures or network requests. */
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Reflector } from "three/addons/objects/Reflector.js";
import { gsap } from "gsap";
import { journeyPosition } from "@/lib/home";

type Pose = { x: number; y: number; z: number; tx: number; ty: number; tz: number; fov: number };
type MaterialName = "stone" | "edge" | "roof" | "shadow" | "metal" | "light" | "dim" | "clock" | "glass" | "bridge";

function clockTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const c = canvas.getContext("2d")!;
  c.translate(256, 256);
  c.fillStyle = "#bba16b";
  c.beginPath(); c.arc(0, 0, 254, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#172a2a";
  c.beginPath(); c.arc(0, 0, 239, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#fff2cc";
  c.beginPath(); c.arc(0, 0, 215, 0, Math.PI * 2); c.fill();
  c.strokeStyle = "#657060"; c.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    c.save(); c.rotate(i * Math.PI / 30);
    c.beginPath(); c.moveTo(0, -207); c.lineTo(0, i % 5 === 0 ? -184 : -197); c.stroke(); c.restore();
  }
  c.fillStyle = "#26352f"; c.font = "32px Georgia"; c.textAlign = "center"; c.textBaseline = "middle";
  const numbers = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
  numbers.forEach((n, i) => {
    const angle = i * Math.PI / 6;
    c.fillText(n, Math.sin(angle) * 167, -Math.cos(angle) * 167);
  });
  c.strokeStyle = "#52604d"; c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, 133, 0, Math.PI * 2); c.stroke();
  // An authored evening, rather than a live clock (no perpetual animation).
  for (const [angle, length, width] of [[0.95, 110, 12], [3.75, 156, 7]]) {
    c.save(); c.rotate(angle); c.fillStyle = "#1a302c";
    c.beginPath(); c.moveTo(-width, 22); c.lineTo(-width / 2, -length + 17);
    c.lineTo(0, -length); c.lineTo(width / 2, -length + 17); c.lineTo(width, 22); c.fill(); c.restore();
  }
  c.fillStyle = "#aa8f50"; c.beginPath(); c.arc(0, 0, 12, 0, Math.PI * 2); c.fill();
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeCity(scene: THREE.Scene) {
  const texture = clockTexture();
  const stone = (color: number) => {
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.87, metalness: 0.02 });
    // World-space courses and grain avoid stretching a tiny bitmap over a tall facade.
    material.onBeforeCompile = shader => {
      shader.vertexShader = "varying vec3 vStone;\n" + shader.vertexShader.replace("#include <begin_vertex>", "#include <begin_vertex>\nvStone = (modelMatrix * vec4(transformed, 1.)).xyz;");
      shader.fragmentShader = "varying vec3 vStone;\n" + shader.fragmentShader.replace("#include <color_fragment>", `#include <color_fragment>
        float grain = fract(sin(dot(floor(vStone * 140.), vec3(127.1,311.7,74.7))) * 43758.5453);
        float course = fract(vStone.y * 3.2);
        float joint = smoothstep(.015,.055,course);
        float block = fract(sin(dot(floor(vStone * vec3(2.,3.2,2.)),vec3(17.,47.,113.))) * 43758.5453);
        diffuseColor.rgb *= (.86 + grain*.09 + block*.09) * (.83 + joint*.17);
      `);
    };
    return material;
  };
  const materials: Record<MaterialName, THREE.Material> = {
    stone: stone(0x877c66), edge: stone(0xb4a080), roof: stone(0x172b32), shadow: stone(0x233237),
    metal: new THREE.MeshStandardMaterial({ color: 0x25423e, roughness: 0.55, metalness: 0.65 }),
    bridge: new THREE.MeshStandardMaterial({ color: 0x658d9a, roughness: 0.52, metalness: 0.5 }),
    light: new THREE.MeshBasicMaterial({ color: 0xffd398, toneMapped: false }),
    dim: new THREE.MeshBasicMaterial({ color: 0x97744a }),
    clock: new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide }),
    glass: new THREE.MeshStandardMaterial({ color: 0xffd5a0, transparent: true, opacity: 0.2, roughness: 0.2, depthWrite: false }),
  };
  // Batch static details by material: the windows/pinnacles do not each cost a draw call.
  const batches = new Map<MaterialName, THREE.BufferGeometry[]>();
  const matrix = new THREE.Matrix4(); const q = new THREE.Quaternion();
  function part(g: THREE.BufferGeometry, mat: MaterialName, x: number, y: number, z: number, rx = 0, ry = 0, rz = 0) {
    q.setFromEuler(new THREE.Euler(rx, ry, rz));
    matrix.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1));
    const flat = g.index ? g.toNonIndexed() : g.clone();
    g.dispose(); flat.applyMatrix4(matrix);
    if (!batches.has(mat)) batches.set(mat, []);
    batches.get(mat)!.push(flat);
  }
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, m: MaterialName = "stone") =>
    part(new THREE.BoxGeometry(w, h, d), m, x, y, z);
  function rod(a: THREE.Vector3, b: THREE.Vector3, radius: number, m: MaterialName = "metal") {
    const g = new THREE.CylinderGeometry(radius, radius, a.distanceTo(b), 6);
    const rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    const e = new THREE.Euler().setFromQuaternion(rot); const p = a.clone().add(b).multiplyScalar(0.5);
    part(g, m, p.x, p.y, p.z, e.x, e.y, e.z);
  }
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  function pointedWindow(x: number, y: number, z: number, width: number, height: number, ry = 0, lit = false) {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(width / 2, height * 0.72);
    s.quadraticCurveTo(width / 2, height * 0.87, 0, height);
    s.quadraticCurveTo(-width / 2, height * 0.87, -width / 2, height * 0.72); s.closePath();
    part(new THREE.ShapeGeometry(s), lit ? "dim" : "shadow", x, y, z, 0, ry);
  }

  // Elizabeth Tower: stone ribs, cornices, Gothic recesses, four clock dials and tiered roof.
  const tx = 12, tz = -12;
  box(3.2, 13.8, 3.2, tx, 6.9, tz);
  box(3.85, 3.9, 3.85, tx, 15.5, tz);
  for (const y of [0.7, 2, 5.3, 10.5, 12.5, 13.4, 13.75, 17.4, 17.7]) {
    box(y > 13 ? 4.08 : 3.55, 0.16, y > 13 ? 4.08 : 3.55, tx, y, tz, "edge");
  }
  for (const dx of [-1.5, 1.5]) for (const dz of [-1.5, 1.5]) {
    box(0.25, 13, 0.25, tx + dx, 6.5, tz + dz, "edge");
    box(0.34, 4.3, 0.34, tx + dx * 1.21, 15.5, tz + dz * 1.21, "edge");
    part(new THREE.ConeGeometry(0.23, 1.8, 4), "edge", tx + dx * 1.21, 18.55, tz + dz * 1.21, 0, Math.PI / 4);
  }
  for (let side = 0; side < 4; side++) {
    const angle = side * Math.PI / 2;
    const normal = v(Math.sin(angle), 0, Math.cos(angle)); const tangent = v(Math.cos(angle), 0, -Math.sin(angle));
    const face = v(tx, 15.5, tz).addScaledVector(normal, 1.94);
    part(new THREE.CircleGeometry(1.4, 64), "clock", face.x, face.y, face.z, 0, angle);
    part(new THREE.TorusGeometry(1.43, 0.055, 6, 64), "edge", face.x, face.y, face.z, 0, angle);
    for (const dx of [-1.58, 1.58]) for (const dy of [-1.57, 1.57]) {
      const p = face.clone().addScaledVector(tangent, dx); p.y += dy;
      part(new THREE.SphereGeometry(0.1, 6, 4), "edge", p.x, p.y, p.z);
    }
    for (const dx of [-0.68, 0, 0.68]) {
      const p = v(tx, 6.4, tz).addScaledVector(normal, 1.61).addScaledVector(tangent, dx);
      pointedWindow(p.x, p.y, p.z, 0.46, 5.45, angle);
      const rib = p.clone().addScaledVector(tangent, -0.27);
      rod(v(rib.x, 5.9, rib.z), v(rib.x, 12, rib.z), 0.045, "edge");
      rod(v(p.x, 6.4, p.z), v(p.x, 11.2, p.z), 0.026, "edge");
      for (const y of [7.5, 9.5]) {
        const l = p.clone().addScaledVector(tangent, -0.22), r = p.clone().addScaledVector(tangent, 0.22);
        rod(v(l.x, y, l.z), v(r.x, y, r.z), 0.022, "edge");
      }
    }
  }
  for (let k = 0; k < 8; k++) box(3.15, 0.045, 3.15, tx, 18 + k * 0.13, tz, "edge");
  box(3.2, 1.2, 3.2, tx, 18.4, tz, "shadow");
  part(new THREE.ConeGeometry(2.55, 3.55, 4), "roof", tx, 20.5, tz, 0, Math.PI / 4);
  part(new THREE.ConeGeometry(0.7, 2.2, 4), "edge", tx, 23.1, tz, 0, Math.PI / 4);
  rod(v(tx, 23.9, tz), v(tx, 25.2, tz), 0.035, "edge");
  // Roof seams and corner pinnacles keep the silhouette architectural at a distance.
  for (const dx of [-1, 1]) for (const dz of [-1, 1]) {
    rod(v(tx + dx * 1.78, 18.8, tz + dz * 1.78), v(tx, 22.3, tz), 0.045, "edge");
    const x = tx + dx * 1.74, z = tz + dz * 1.74;
    box(0.25, 1.4, 0.25, x, 18.3, z, "edge");
    part(new THREE.ConeGeometry(0.21, 1.3, 4), "edge", x, 19.55, z, 0, Math.PI / 4);
  }
  for (let y = 1.2; y < 6; y += 0.65) box(3.28, 0.045, 3.28, tx, y, tz, "edge");

  // Palace river frontage: repeated narrow bays, traceries, parapet and roof lanterns.
  box(28, 4.7, 4.8, 28, 2.15, -15.8);
  box(38, 0.9, 8, 27, -0.2, -14, "shadow");
  box(28.4, 0.25, 5.1, 28, 4.7, -15.8, "edge");
  box(28, 0.25, 5, 28, 1.1, -15.8, "edge");
  for (let i = 0; i < 43; i++) {
    const x = 14.4 + i * 0.64;
    pointedWindow(x, 1.4, -13.36, 0.4, 2.75, 0, i % 5 !== 0);
    box(0.045, 2.3, 0.06, x, 2.55, -13.29, "edge");
    box(0.44, 0.07, 0.06, x, 2.8, -13.28, "edge");
    box(0.075, 4.8, 0.2, x - 0.29, 2.7, -13.2, "edge");
    part(new THREE.ConeGeometry(0.15, 0.8, 4), "edge", x - 0.29, 5.25, -13.25, 0, Math.PI / 4);
  }
  for (const x of [19, 27, 35, 41]) {
    box(1.4, 1.9, 2.2, x, 5.4, -15, "stone");
    part(new THREE.ConeGeometry(1.2, 2.2, 4), "roof", x, 7.35, -15, 0, Math.PI / 4);
  }

  // London Eye in the atmospheric middle distance, with a complete spoke/capsule silhouette.
  const ex = -8, ey = 9.8, ez = -35, radius = 8.2;
  part(new THREE.TorusGeometry(radius, 0.065, 8, 112), "light", ex, ey, ez);
  part(new THREE.TorusGeometry(radius - 0.22, 0.032, 5, 112), "light", ex, ey, ez + 0.14);
  for (let i = 0; i < 32; i++) {
    const a = i * Math.PI / 16; const x = ex + Math.sin(a) * radius, y = ey + Math.cos(a) * radius;
    rod(v(ex, ey, ez), v(x, y, ez), 0.018, "edge");
    part(new THREE.SphereGeometry(0.33, 8, 6).scale(1.45, 0.8, 0.85), "shadow", x, y, ez);
    box(0.35, 0.06, 0.07, x, y, ez + 0.3, "light");
  }
  rod(v(ex - 3, 0, ez + 2.4), v(ex, ey, ez), 0.18, "edge");
  rod(v(ex + 3, 0, ez + 2.4), v(ex, ey, ez), 0.18, "edge");

  // Westminster Bridge. Shallow arch ribs, piers and hundreds of slender balusters.
  box(100, 0.38, 3, 0, 2.2, 1, "metal");
  for (let x = -45; x < 46; x += 9) {
    box(1, 2.2, 3.6, x, 0.6, 1, "stone");
    const curve = new THREE.CatmullRomCurve3([v(x, 0.9, 2.3), v(x + 2.2, 1.8, 2.3), v(x + 4.5, 2, 2.3), v(x + 6.8, 1.8, 2.3), v(x + 9, 0.9, 2.3)]);
    part(new THREE.TubeGeometry(curve, 24, 0.14, 6, false), "metal", 0, 0, 0);
  }
  box(100, 0.07, 0.07, 0, 3.2, 2.48, "edge");
  box(100, 0.08, 0.08, 0, 2.65, 2.48, "metal");
  for (let x = -49; x < 50; x += 0.42) box(0.04, 0.82, 0.06, x, 2.8, 2.48, "metal");
  for (let x = -42; x < 45; x += 12) {
    rod(v(x, 2.4, 1), v(x, 5.3, 1), 0.055);
    part(new THREE.SphereGeometry(0.14, 8, 6), "light", x, 5.35, 1);
  }

  // Tower Bridge provides the later work/experience/contact views within this same London study.
  const bz = -22;
  for (const x of [-55, -37]) {
    box(4.8, 1.2, 6.6, x, 0, bz, "shadow");
    box(3.7, 13.5, 4.6, x, 7, bz);
    for (const y of [1.4, 5.2, 9.8, 12.5, 13.7]) box(4, 0.22, 4.9, x, y, bz, "edge");
    for (const dx of [-1.65, 1.65]) for (const dz of [-2, 2]) {
      box(0.42, 14, 0.42, x + dx, 7.5, bz + dz, "edge");
      part(new THREE.ConeGeometry(0.49, 2, 4), "roof", x + dx, 15.4, bz + dz, 0, Math.PI / 4);
    }
    for (const dx of [-0.9, 0, 0.9]) for (const y of [4, 7, 10.5]) {
      pointedWindow(x + dx, y, bz + 2.31, 0.44, 1.7, 0, true);
      box(0.045, 1.35, 0.06, x + dx, y + 0.65, bz + 2.36, "edge");
    }
    box(2.6, 0.6, 3.4, x, 14.1, bz, "edge");
    part(new THREE.ConeGeometry(2.15, 2.5, 4), "roof", x, 15.65, bz, 0, Math.PI / 4);
    rod(v(x, 16.7, bz), v(x, 17.7, bz), 0.03, "edge");
  }
  for (const z of [bz - 1.5, bz + 1.5]) {
    box(18, 0.55, 0.4, -46, 12.3, z, "bridge");
    box(18, 0.12, 0.4, -46, 13.1, z, "edge");
    for (let x = -54; x <= -38; x += 0.55) box(0.04, 0.65, 0.06, x, 12.7, z, "bridge");
    const cable = new THREE.CatmullRomCurve3([v(-74, 2.3, z), v(-65, 4.4, z), v(-55, 11.8, z), v(-46, 5, z), v(-37, 11.8, z), v(-27, 4.4, z), v(-18, 2.3, z)]);
    part(new THREE.TubeGeometry(cable, 100, 0.13, 6, false), "bridge", 0, 0, 0);
    for (let x = -73; x < -18; x += 1.2) {
      const p = cable.getPoint((x + 74) / 56);
      rod(v(p.x, 2.5, z), p, 0.025, "bridge");
    }
  }
  box(58, 0.45, 4.1, -46, 2.2, bz, "bridge");
  const bridgeLight = new THREE.PointLight(0xffd6a3, 140, 32, 2); bridgeLight.position.set(-46, 11, bz + 6); scene.add(bridgeLight);

  // Far bank: deliberately subdued, with irregular rooflines and sparse lit windows.
  box(150, 0.9, 8, 0, -0.1, -44, "shadow");
  for (let i = 0; i < 40; i++) {
    const x = -65 + i * 3.2; const h = 2.8 + ((i * 17) % 11) * 0.32;
    box(2.9, h, 3, x, h / 2, -44 - (i % 4), "shadow");
    box(0.3, 0.6, 0.06, x + 0.8, h - 1, -42.4 - (i % 4), i % 3 === 0 ? "dim" : "shadow");
    for (let j = 0; j < 3; j++) {
      box(0.2, 0.35, 0.04, x - 0.8 + j * 0.65, 1.3, -42.45 - (i % 4), (i + j) % 3 === 0 ? "dim" : "shadow");
    }
    box(0.28, 0.6, 0.35, x - 0.7, h + 0.2, -44 - (i % 4));
  }

  // Near river railing and one warm lantern: the camera passes this in the first transition.
  box(180, 0.45, 4, -20, -1.1, 30, "shadow");
  for (let x = -100; x < 60; x += 1.1) {
    rod(v(x, -0.8, 28), v(x, 0.85, 28), 0.045);
    if (Math.round((x + 40) / 1.1) % 4 === 0) part(new THREE.SphereGeometry(0.09, 6, 4), "metal", x, 0.92, 28);
  }
  box(180, 0.08, 0.09, -20, 0.82, 28, "metal");
  box(180, 0.07, 0.09, -20, -0.45, 28, "metal");
  const lx = 13.8, lz = 24;
  part(new THREE.CylinderGeometry(0.12, 0.27, 6.8, 12), "metal", lx, 2.5, lz);
  for (const y of [-0.7, -0.4, 0, 4.9, 5.25]) part(new THREE.CylinderGeometry(0.26, 0.26, 0.12, 12), "metal", lx, y, lz);
  box(0.5, 0.9, 0.5, lx, 5.9, lz, "glass");
  part(new THREE.SphereGeometry(0.12, 12, 8).scale(1, 2.5, 1), "light", lx, 5.9, lz);
  for (const dx of [-0.3, 0.3]) for (const dz of [-0.3, 0.3]) rod(v(lx + dx, 5.35, lz + dz), v(lx + dx * 0.8, 6.5, lz + dz * 0.8), 0.04);
  part(new THREE.ConeGeometry(0.58, 0.45, 4), "metal", lx, 6.68, lz, 0, Math.PI / 4);
  rod(v(lx, 6.8, lz), v(lx, 7.18, lz), 0.035);

  for (const [name, geometries] of batches) {
    const merged = mergeGeometries(geometries);
    if (merged) scene.add(new THREE.Mesh(merged, materials[name]));
    geometries.forEach(g => g.dispose());
  }
  const glow = new THREE.PointLight(0xffcc86, 28, 15, 2); glow.position.set(lx, 5.8, lz); scene.add(glow);
  const towerLight = new THREE.PointLight(0xffd39b, 160, 32, 2); towerLight.position.set(tx, 12, -5); scene.add(towerLight);
  const glowCanvas = document.createElement("canvas"); glowCanvas.width = glowCanvas.height = 128;
  const c = glowCanvas.getContext("2d")!, gradient = c.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,218,162,.6)"); gradient.addColorStop(0.15, "rgba(255,195,117,.18)"); gradient.addColorStop(1, "rgba(255,179,96,0)");
  c.fillStyle = gradient; c.fillRect(0, 0, 128, 128);
  const glowTexture = new THREE.CanvasTexture(glowCanvas); glowTexture.colorSpace = THREE.SRGBColorSpace;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.6, toneMapped: false }));
  halo.position.set(lx, 5.9, lz); halo.scale.set(3, 3, 1); scene.add(halo);
  return [texture, glowTexture];
}

const skyVertex = `varying vec3 vWorld; void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const skyFragment = `varying vec3 vWorld;
void main(){vec3 d=normalize(vWorld);float h=smoothstep(-.05,.65,d.y);
vec3 c=mix(vec3(.055,.085,.115),vec3(.003,.011,.025),h);
float haze=pow(max(0.,1.-abs(d.y)*4.),5.);c+=vec3(.015,.012,.008)*haze;
float cloud=sin(d.x*28.+sin(d.z*12.))*sin(d.z*27.+d.y*55.);
c+=cloud*.003*smoothstep(.04,.3,d.y);gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
const waterVertex = `uniform mat4 textureMatrix;varying vec4 vReflection;varying vec3 vWorld;void main(){vReflection=textureMatrix*vec4(position,1.);vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
const waterFragment = `uniform float uTime;uniform sampler2D tDiffuse;varying vec4 vReflection;varying vec3 vWorld;
void main(){vec2 p=vWorld.xz;
float wave=sin(p.y*4.+sin(p.x*.8)+uTime)*.6+sin(p.y*11.3-p.x*2.1+uTime)*.25+sin(p.y*23.+sin(p.x*2.)*2.)*.15;
vec2 uv=vReflection.xy/vReflection.w;uv.x+=wave*.006;uv.y+=sin(p.y*9.+p.x*.7)*.001;
vec3 reflected=texture2D(tDiffuse,uv).rgb;
vec3 c=mix(vec3(.012,.028,.039),reflected,.58);
c+=vec3(.009,.014,.018)*pow(max(0.,wave),5.);
gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;

/** A paused GSAP score is scrubbed by the real app pane; there is no document-scroll dependency or idle render loop. */
export function mountLondonScene(host: HTMLElement, scroller: HTMLElement, about: HTMLElement, onReady: () => void, onFailure: () => void) {
  const canvas = document.createElement("canvas"); canvas.setAttribute("aria-hidden", "true");
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" }); }
  catch { onFailure(); return () => {}; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x2c404d, 0.012);
  scene.add(new THREE.HemisphereLight(0x88accd, 0x22282b, 1.15));
  const moon = new THREE.DirectionalLight(0xa8c5dc, 1.3); moon.position.set(-25, 40, 30); scene.add(moon);
  const dusk = new THREE.DirectionalLight(0xe2c598, 0.8); dusk.position.set(20, 15, -20); scene.add(dusk);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(350, 32, 16), new THREE.ShaderMaterial({ vertexShader: skyVertex, fragmentShader: skyFragment, side: THREE.BackSide, depthWrite: false })); scene.add(sky);
  const textures = makeCity(scene);
  const water = new Reflector(new THREE.PlaneGeometry(260, 240), {
    textureWidth: host.clientWidth < 650 ? 512 : 1024, textureHeight: 512, multisample: 0, clipBias: 0.003,
    shader: { uniforms: { color: { value: null }, tDiffuse: { value: null }, textureMatrix: { value: null }, uTime: { value: 0 } }, vertexShader: waterVertex, fragmentShader: waterFragment },
  });
  const waterMaterial = water.material as THREE.ShaderMaterial;
  water.rotation.x = -Math.PI / 2; water.position.set(0, -0.35, -25); scene.add(water);
  const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 500);
  const pose: Pose = { x: 1, y: 8.5, z: 45, tx: -7, ty: 10, tz: -10, fov: 43 };
  let timeline: gsap.core.Timeline;
  let stops: { id: string; top: number }[] = [], scoreTime = 0, holding = true;
  const story = about.closest<HTMLElement>(".home-story")!;
  let frame = 0, disposed = false, ready = false, compiled = false;
  let pointerX = 0, pointerY = 0;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const draw = () => {
    frame = 0;
    if (disposed || !compiled || document.hidden || !host.isConnected) return;
    camera.position.set(pose.x + pointerX, pose.y + pointerY, pose.z);
    camera.fov = pose.fov; camera.lookAt(pose.tx, pose.ty, pose.tz); camera.updateProjectionMatrix();
    host.parentElement?.style.setProperty("--home-lead-shade", String(Math.max(0, 1 - scoreTime)));
    try { renderer.render(scene, camera); }
    catch { onFailure(); return; }
    // Scroll Craft verification describes the pose actually painted, rather than raw input progress.
    host.dataset.scVerifyState = [camera.position.x, camera.position.y, camera.position.z, pose.tx, pose.ty, pose.tz, pose.fov].map(n => n.toFixed(2)).join(",");
    host.dataset.scVerifyHold = String(holding);
    host.dataset.homeWaypoint = stops[Math.floor(scoreTime)]?.id ?? "arrival";
    if (!ready) { ready = true; onReady(); }
  };
  const requestDraw = () => { if (!frame && !disposed && !document.hidden) frame = requestAnimationFrame(draw); };
  function scroll() {
    const current = journeyPosition(stops.map(stop => stop.top), scroller.scrollTop, scroller.clientHeight);
    scoreTime = current.time; holding = current.hold;
    timeline?.time(scoreTime); waterMaterial.uniforms.uTime.value = scoreTime * 3;
    if (holding && scoreTime >= 1) pointerX = pointerY = 0;
    requestDraw();
  }
  function resize() {
    const width = host.clientWidth, height = host.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height;
    const phone = width < 650;
    const start: Pose = phone
      ? { x: 0, y: 13, z: 64, tx: 9, ty: 19, tz: -10, fov: 48 }
      : { x: 1, y: 8.5, z: 45, tx: -7, ty: 10, tz: -10, fov: 43 };
    const end: Pose = phone
      ? { x: 15, y: 9, z: 48, tx: 14, ty: 15, tz: -10, fov: 48 }
      : { x: 15, y: 6.7, z: 34, tx: 20, ty: 9, tz: -10, fov: 43 };
    const poses: Record<string, Pose> = {
      arrival: start, about: end,
      interests: phone ? { x: 8, y: 11, z: 52, tx: 7, ty: 16, tz: -18, fov: 48 } : { x: 4, y: 7, z: 35, tx: -1, ty: 9, tz: -20, fov: 43 },
      technology: phone ? { x: -10, y: 12, z: 49, tx: -7, ty: 16, tz: -28, fov: 48 } : { x: -2, y: 7, z: 34, tx: -10, ty: 10, tz: -30, fov: 43 },
      work: phone ? { x: -42, y: 11, z: 53, tx: -46, ty: 14, tz: -10, fov: 48 } : { x: -34, y: 7, z: 38, tx: -46, ty: 9, tz: -10, fov: 43 },
      experience: phone ? { x: -58, y: 10, z: 46, tx: -45, ty: 14, tz: -10, fov: 48 } : { x: -62, y: 6, z: 40, tx: -68, ty: 9, tz: -10, fov: 43 },
      writing: phone ? { x: -48, y: 12, z: 52, tx: -46, ty: 15, tz: -10, fov: 48 } : { x: -54, y: 9, z: 45, tx: -27, ty: 9, tz: -10, fov: 43 },
      contact: phone ? { x: -44, y: 10, z: 55, tx: -46, ty: 13, tz: -10, fov: 48 } : { x: -41, y: 7, z: 46, tx: -47, ty: 8, tz: -10, fov: 43 },
    };
    const inset = story.querySelector<HTMLElement>(".home-wayfinding")?.offsetHeight ?? 0;
    const paneTop = scroller.getBoundingClientRect().top, maxScroll = scroller.scrollHeight - scroller.clientHeight;
    stops = [...story.querySelectorAll<HTMLElement>("[data-home-stop]")]
      .filter(node => node.getClientRects().length && poses[node.dataset.homeStop!])
      .map(node => ({ id: node.dataset.homeStop!, top: Math.max(0, Math.min(maxScroll, node.getBoundingClientRect().top - paneTop + scroller.scrollTop - inset)) }));
    timeline?.kill(); Object.assign(pose, start);
    timeline = gsap.timeline({ paused: true });
    for (const stop of stops.slice(1)) timeline.to(pose, { ...poses[stop.id], duration: 1, ease: "power2.inOut" });
    scroll();
  }
  function pointer(event: PointerEvent) {
    if (!finePointer.matches || holding && scoreTime >= 1) return;
    const r = host.getBoundingClientRect();
    pointerX = THREE.MathUtils.clamp((event.clientX - r.left) / r.width - 0.5, -0.5, 0.5) * 0.45;
    pointerY = THREE.MathUtils.clamp(0.5 - (event.clientY - r.top) / r.height, -0.5, 0.5) * 0.2;
    requestDraw();
  }
  function leave() { pointerX = pointerY = 0; requestDraw(); }
  function contextLost(event: Event) { event.preventDefault(); onFailure(); }
  host.append(canvas);
  const observer = new ResizeObserver(resize); observer.observe(host); observer.observe(story);
  scroller.addEventListener("scroll", scroll, { passive: true });
  scroller.addEventListener("pointermove", pointer, { passive: true }); scroller.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", requestDraw); canvas.addEventListener("webglcontextlost", contextLost);
  resize();
  // Keep the poster visible while drivers prepare shaders; avoid blocking an early app-navigation click.
  async function prepare() {
    let reflectionReady;
    try {
      renderer.setRenderTarget(water.getRenderTarget());
      reflectionReady = renderer.compileAsync(scene, camera);
    } finally { renderer.setRenderTarget(null); }
    await reflectionReady;
    if (disposed) return;
    await renderer.compileAsync(scene, camera);
    if (!disposed) { compiled = true; requestDraw(); }
  }
  void prepare().catch(() => { if (!disposed) onFailure(); });
  return () => {
    disposed = true; cancelAnimationFrame(frame); observer.disconnect(); timeline?.kill();
    host.parentElement?.style.removeProperty("--home-lead-shade");
    host.dataset.scVerifyState = "still"; host.dataset.scVerifyHold = "true";
    scroller.removeEventListener("scroll", scroll); scroller.removeEventListener("pointermove", pointer); scroller.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", requestDraw); canvas.removeEventListener("webglcontextlost", contextLost);
    const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>();
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
      if (object instanceof THREE.Sprite) materials.add(object.material);
    });
    geometries.forEach(g => g.dispose()); materials.delete(waterMaterial); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); water.dispose();
    renderer.dispose(); renderer.forceContextLoss(); canvas.remove();
  };
}
