import * as THREE from "three";

/** A deep-space sky with flowing nebulae, nearby stars and luminous comet tails. */
export class OrbitAtmosphere {
  private group = new THREE.Group();
  private stars: THREE.Points;
  private comets: THREE.Group[] = [];
  private reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  private material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { phase: { value: 0 } },
    vertexShader: `varying vec3 direction;
      void main() {
        direction = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `varying vec3 direction; uniform float phase;
      float hash(vec3 p) {
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }
      float noise(vec3 p) {
        vec3 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float cloud(vec3 p) {
        float sum = 0.0;
        float amplitude = 0.55;
        for (int i = 0; i < 5; i++) {
          sum += noise(p) * amplitude;
          p = p * 2.03 + vec3(7.1, 3.7, 9.2);
          amplitude *= 0.5;
        }
        return sum;
      }
      void main() {
        vec3 p = normalize(direction);
        vec3 drift = vec3(phase * 0.12, phase * 0.04, 0.0);
        float wisps = cloud(p * 4.0 + drift);
        float detail = cloud(p * 9.0 + wisps * 1.7);
        float band = exp(-pow((p.y + 0.35 * sin(p.x * 3.0) - 0.1) * 2.7, 2.0));
        float density = smoothstep(0.30, 0.78, wisps) * band;
        vec3 tint = mix(vec3(0.12, 0.09, 0.4), vec3(0.48, 0.12, 0.3), smoothstep(0.3, 0.7, detail));
        tint = mix(tint, vec3(0.07, 0.35, 0.45), smoothstep(0.1, 0.8, p.x));
        vec3 color = vec3(0.003, 0.006, 0.022) + tint * density * 1.5;
        color += vec3(0.3, 0.24, 0.4) * pow(density, 3.0);
        gl_FragColor = vec4(color, 1.0);
      }`,
  });
  private sky = new THREE.Mesh(new THREE.SphereGeometry(500, 24, 16), this.material);

  constructor(scene: THREE.Scene) {
    scene.add(this.group);
    this.group.add(this.sky);
    const positions = new Float32Array(1800 * 3);
    const colors = new Float32Array(1800 * 3);
    for (let i = 0; i < 1800; i++) {
      const bearing = i * 2.399963;
      const radius = 25 + (i * 37.13 % 260);
      positions[i * 3] = Math.cos(bearing) * radius;
      positions[i * 3 + 1] = Math.sin(bearing) * radius;
      positions[i * 3 + 2] = -(i * 19.7 % 560);
      const brightness = .4 + (i % 11) / 18;
      colors[i * 3] = brightness;
      colors[i * 3 + 1] = brightness * (i % 3 === 0 ? .8 : .95);
      colors[i * 3 + 2] = Math.min(1, brightness * 1.2);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const starMaterial = new THREE.ShaderMaterial({
      vertexColors: true,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `varying vec3 tint;
        void main() {
          tint = color;
          vec4 view = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = clamp(130.0 / max(1.0, -view.z), 1.2, 4.0);
          gl_Position = projectionMatrix * view;
        }`,
      fragmentShader: `varying vec3 tint;
        void main() {
          float radius = length(gl_PointCoord - 0.5) * 2.0;
          if (radius > 1.0) discard;
          gl_FragColor = vec4(tint, pow(1.0 - radius, 1.5));
        }`,
    });
    this.stars = new THREE.Points(geometry, starMaterial);
    this.stars.frustumCulled = false;
    this.group.add(this.stars);
    const headGeometry = new THREE.SphereGeometry(.24, 8, 6);
    const headMaterial = new THREE.MeshBasicMaterial({ color: 0xd8efff });
    const tailGeometry = new THREE.ConeGeometry(.65, 19, 12, 1, true);
    tailGeometry.rotateX(Math.PI / 2);
    tailGeometry.translate(0, 0, -9.5);
    const tailMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: `varying float fade; void main() {
        fade = clamp(1.0 + position.z / 19.0, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
      fragmentShader: `varying float fade; void main() {
        gl_FragColor = vec4(mix(vec3(0.38,0.16,0.8), vec3(0.5,0.85,1.0), fade), fade * 0.45);
      }`,
    });
    for (let i = 0; i < 7; i++) {
      const comet = new THREE.Group();
      comet.add(new THREE.Mesh(headGeometry, headMaterial));
      comet.add(new THREE.Mesh(tailGeometry, tailMaterial));
      this.comets.push(comet);
      this.group.add(comet);
    }
  }

  draw(distance: number, center: THREE.Vector3, courseCenter: (station: number) => THREE.Vector3) {
    this.sky.position.copy(center);
    this.material.uniforms.phase.value = this.reduced ? 0 : distance * .0008;
    const positions = this.stars.geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      const base = i * 19.7 % 560;
      const cycle = Math.floor((distance - base - 60) / 560) + 1;
      positions.setZ(i, -(base + cycle * 560));
    }
    positions.needsUpdate = true;
    this.comets.forEach((comet, i) => {
      const period = 650;
      const travel = this.reduced ? distance : distance * 1.35;
      const base = i * 93;
      const station = base + (Math.floor((travel - base - 90) / period) + 1) * period;
      const phase = (travel - station) / period;
      const position = courseCenter(station - (travel - distance));
      const bearing = i * 2.4;
      position.x += Math.cos(bearing) * 55 + Math.sin(phase * 3) * 15;
      position.y += Math.sin(bearing) * 45;
      comet.position.copy(position);
      comet.lookAt(position.clone().add(new THREE.Vector3(-.3, .12, 1)));
    });
  }

  dispose() {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    this.group.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        geometries.add(object.geometry);
        const list = Array.isArray(object.material) ? object.material : [object.material];
        list.forEach(material => materials.add(material));
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    this.group.removeFromParent();
  }
}
