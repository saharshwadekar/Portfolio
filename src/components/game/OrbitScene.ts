import * as THREE from "three";

import { obstacleProfiles, type OrbitGate } from "./orbitObstacles";
import { OrbitAtmosphere } from "./OrbitAtmosphere";
export type { OrbitGate } from "./orbitObstacles";

/** World-space course. The camera travels forward while the structures stay fixed. */
export class OrbitScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(84, 1, .1, 650);
  private track: THREE.Mesh;
  private obstacles: THREE.Group[] = [];
  private segment = -1;
  private atmosphere: OrbitAtmosphere;
  private barrierMaterial = new THREE.MeshStandardMaterial({ color: 0x594358, roughness: .35, metalness: .65 });
  private markerGeometry = new THREE.BoxGeometry(.16, 3.2, 1.1);
  private markerMaterial = new THREE.MeshBasicMaterial({ color: 0xa4ffdb });
  private scenery: THREE.Group[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x0c1021);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.scene.fog = new THREE.FogExp2(0x0c1021, .006);
    this.scene.add(new THREE.HemisphereLight(0xc3b9ff, 0x1a162a, 3));
    const sunlight = new THREE.DirectionalLight(0xffcca3, 4);
    sunlight.position.set(30, 60, 20); this.scene.add(sunlight);
    this.track = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0x354762, roughness: .45, metalness: .7 }));
    this.scene.add(this.track);
    this.atmosphere = new OrbitAtmosphere(this.scene);
    const hoopGeometry = new THREE.TorusGeometry(1.56, .025, 4, 32);
    const hoopMaterial = new THREE.MeshBasicMaterial({ color: 0x9199ff });
    for (let i = 0; i < 90; i++) {
      const group = new THREE.Group();
      group.add(new THREE.Mesh(hoopGeometry, hoopMaterial));
      this.scenery.push(group); this.scene.add(group);
    }
    this.resize(canvas.clientWidth, canvas.clientHeight);
  }

  resize(width: number, height: number) {
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  private center(distance: number) {
    return new THREE.Vector3(
      Math.sin(distance * .011) * 40 + Math.sin(distance * .023) * 12,
      Math.sin(distance * .019) * 38 + Math.sin(distance * .007 + .6) * 16,
      -distance,
    );
  }

  private frame(distance: number) {
    const center = this.center(distance);
    const forward = this.center(distance + .1).sub(center).normalize();
    const right = new THREE.Vector3(1, 0, 0).addScaledVector(forward, -forward.x).normalize();
    const up = right.clone().cross(forward).normalize();
    const rotation = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, up, forward.clone().negate()));
    return { center, forward, right, up, rotation };
  }

  draw(angle: number, distance: number, gates: OrbitGate[]) {
    const segment = Math.floor(distance / 20);
    if (segment !== this.segment) {
      this.segment = segment;
      const start = segment * 20 - 30;
      const curve = new THREE.CatmullRomCurve3(Array.from({ length: 70 }, (_, i) => this.center(start + i * 6)));
      this.track.geometry.dispose();
      this.track.geometry = new THREE.TubeGeometry(curve, 180, 1.5, 16, false);
      this.scenery.forEach((group, i) => {
        const station = this.frame(start + i * 4);
        group.position.copy(station.center); group.quaternion.copy(station.rotation);
      });
    }
    while (this.obstacles.length < gates.length) {
      const group = new THREE.Group();
      for (const profile of obstacleProfiles) {
        const variant = new THREE.Group();
        const period = Math.PI * 2 / profile.openings;
        const shape = new THREE.Shape();
        shape.absarc(0, 0, profile.radius, profile.halfGap, period - profile.halfGap, false);
        shape.lineTo(Math.cos(period - profile.halfGap) * 1.5, Math.sin(period - profile.halfGap) * 1.5);
        shape.absarc(0, 0, 1.5, period - profile.halfGap, profile.halfGap, true);
        shape.closePath();
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: 1.2, bevelEnabled: false, curveSegments: 24 });
        geometry.translate(0, 0, -.6);
        const edges = new THREE.EdgesGeometry(geometry, 25);
        const color = new THREE.LineBasicMaterial({ color: profile.color });
        for (let opening = 0; opening < profile.openings; opening++) {
          const sector = new THREE.Group();
          sector.add(new THREE.Mesh(geometry, this.barrierMaterial));
          sector.add(new THREE.LineSegments(edges, color));
          for (const side of [-1, 1]) {
            const marker = new THREE.Mesh(this.markerGeometry, this.markerMaterial);
            const bearing = profile.halfGap * side;
            marker.position.set(Math.cos(bearing) * 3.2, Math.sin(bearing) * 3.2, -.7);
            marker.rotation.z = bearing - Math.PI / 2;
            sector.add(marker);
          }
          sector.rotation.z = opening * period; variant.add(sector);
        }
        group.add(variant);
      }
      this.obstacles.push(group); this.scene.add(group);
    }
    this.obstacles.forEach((group, i) => {
      group.visible = i < gates.length;
      if (!group.visible) return;
      group.children.forEach((variant, kind) => { variant.visible = kind === gates[i].kind; });
      const station = this.frame(gates[i].distance);
      group.position.copy(station.center); group.quaternion.copy(station.rotation);
      group.rotateZ(gates[i].angle);
    });
    const station = this.frame(distance);
    const radial = station.right.multiplyScalar(Math.cos(angle)).addScaledVector(station.up, Math.sin(angle));
    this.camera.position.copy(station.center).addScaledVector(radial, 3);
    this.camera.up.copy(radial);
    const target = this.center(distance + 12).addScaledVector(radial, 2.5);
    this.camera.lookAt(target);
    this.atmosphere.draw(distance, station.center, stationDistance => this.center(stationDistance));
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.atmosphere.dispose();
    const geometries = new Set<THREE.BufferGeometry>([this.markerGeometry]);
    const materials = new Set<THREE.Material>([this.barrierMaterial, this.markerMaterial]);
    this.scene.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
        geometries.add(object.geometry);
        for (const material of Array.isArray(object.material) ? object.material : [object.material]) materials.add(material);
      }
    });
    geometries.forEach(geometry => geometry.dispose());
    materials.forEach(material => material.dispose());
    this.renderer.dispose();
  }
}
