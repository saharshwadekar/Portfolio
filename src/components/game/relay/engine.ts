export type Phase = "ready" | "playing" | "paused" | "upgrade" | "won" | "lost";
export type Upgrade = "power" | "speed" | "shield";
type Point = { x: number; y: number };
type Enemy = Point & { hp: number; max: number; kind: number; fire: number };
type Shot = Point & { vx: number; vy: number; life: number; hostile: boolean };
type Particle = Point & { vx: number; vy: number; life: number; color: string };
export type Input = { x: number; y: number; aim: Point | null; firing: boolean; dash: boolean; touch: boolean };
export const WORLD = 2100;
export const relays = [{ x: 430, y: 430, name: "INTERFACE" }, { x: 1670, y: 540, name: "SERVICES" }, { x: 1150, y: 1690, name: "DATA" }];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);
export class RelayEngine {
  phase: Phase = "ready";
  player = { x: 1050, y: 1050, hp: 100, angle: -Math.PI / 2, invincible: 0 };
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  particles: Particle[] = [];
  pickups: Point[] = [];
  charge = [0, 0, 0];
  score = 0;
  time = 0;
  dash = 0;
  fire = 0;
  spawn = 0;
  power = 1;
  speed = 1;
  bossSpawned = false;
  reduced = false;
  camera = { x: 1050, y: 1050 };
  get restored() { return this.charge.filter(v => v >= 100).length; }
  start() { this.phase = "playing"; }
  upgrade(kind: Upgrade) {
    if (this.phase !== "upgrade") return;
    if (kind === "power") this.power += 0.65;
    if (kind === "speed") this.speed += 0.2;
    if (kind === "shield") this.player.hp = Math.min(100, this.player.hp + 55);
    this.player.invincible = 2;
    this.phase = "playing";
  }
  burst(x: number, y: number, color: string, count = 16) {
    if (this.reduced) count = 4;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 180;
      this.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.4 + Math.random() * 0.4, color });
    }
  }
  addEnemy(kind: number) {
    const a = Math.random() * Math.PI * 2;
    const hp = kind === 2 ? 150 : kind === 1 ? 5 : 3;
    this.enemies.push({ x: clamp(this.player.x + Math.cos(a) * 560, 60, WORLD - 60), y: clamp(this.player.y + Math.sin(a) * 560, 60, WORLD - 60), hp, max: hp, kind, fire: 1.5 });
  }
  update(dt: number, input: Input, width: number, height: number) {
    if (this.phase !== "playing") return;
    this.time += dt;
    this.dash = Math.max(0, this.dash - dt);
    this.player.invincible = Math.max(0, this.player.invincible - dt);
    const length = Math.hypot(input.x, input.y) || 1;
    const dx = input.x / Math.max(1, length), dy = input.y / Math.max(1, length);
    if (input.dash && this.dash === 0 && (dx || dy)) {
      this.player.x = clamp(this.player.x + dx * 180, 30, WORLD - 30);
      this.player.y = clamp(this.player.y + dy * 180, 30, WORLD - 30);
      this.player.invincible = 0.45;
      this.dash = 2.5;
      this.burst(this.player.x, this.player.y, "#80e9ff", 20);
    }
    this.player.x = clamp(this.player.x + dx * 225 * this.speed * dt, 30, WORLD - 30);
    this.player.y = clamp(this.player.y + dy * 225 * this.speed * dt, 30, WORLD - 30);
    this.camera.x += (this.player.x - this.camera.x) * Math.min(1, dt * 9);
    this.camera.y += (this.player.y - this.camera.y) * Math.min(1, dt * 9);
    let target: Point | undefined;
    if (input.touch) target = this.enemies.reduce<Enemy | undefined>((best, e) => !best || distance(e, this.player) < distance(best, this.player) ? e : best, undefined);
    else if (input.aim) target = { x: input.aim.x - width / 2 + this.camera.x, y: input.aim.y - height / 2 + this.camera.y };
    if (target) this.player.angle = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    this.fire -= dt;
    if ((input.firing || (input.touch && target)) && this.fire <= 0) {
      this.fire = 0.18;
      const a = this.player.angle;
      this.shots.push({ x: this.player.x + Math.cos(a) * 22, y: this.player.y + Math.sin(a) * 22, vx: Math.cos(a) * 800, vy: Math.sin(a) * 800, life: 0.85, hostile: false });
    }
    this.spawn -= dt;
    if (this.spawn <= 0 && this.enemies.length < 28) {
      this.spawn = Math.max(0.65, 2.1 - this.restored * 0.4 - this.time / 220);
      this.addEnemy(Math.random() < 0.3 ? 1 : 0);
    }
    for (let i = 0; i < relays.length; i++) {
      if (this.charge[i] >= 100 || distance(this.player, relays[i]) > 100) continue;
      this.charge[i] = Math.min(100, this.charge[i] + dt * 12.5);
      if (this.charge[i] === 100) {
        this.score += 500;
        this.player.hp = Math.min(100, this.player.hp + 15);
        this.burst(relays[i].x, relays[i].y, "#a1ffb6", 40);
        if (this.restored < 3) this.phase = "upgrade";
      }
    }
    if (this.restored === 3 && !this.bossSpawned) { this.addEnemy(2); this.bossSpawned = true; }
    for (const e of this.enemies) {
      const a = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      const d = distance(e, this.player);
      const speed = e.kind === 2 ? 60 : e.kind === 1 ? 80 : 115 + this.restored * 12;
      if (e.kind !== 1 || d > 270) { e.x += Math.cos(a) * speed * dt; e.y += Math.sin(a) * speed * dt; }
      e.fire -= dt;
      if (e.kind > 0 && e.fire <= 0) {
        e.fire = e.kind === 2 ? 1.3 : 2.3;
        const spread = e.kind === 2 ? 7 : 1;
        for (let j = 0; j < spread; j++) {
          const angle = a + (j - (spread - 1) / 2) * 0.22;
          this.shots.push({ x: e.x, y: e.y, vx: Math.cos(angle) * 250, vy: Math.sin(angle) * 250, life: 3, hostile: true });
        }
      }
      if (d < (e.kind === 2 ? 52 : 28)) this.hurt(16);
    }
    for (const s of this.shots) {
      s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (s.hostile) {
        if (distance(s, this.player) < 19) { this.hurt(10); s.life = 0; }
      } else {
        const e = this.enemies.find(e => e.hp > 0 && distance(s, e) < (e.kind === 2 ? 44 : 24));
        if (e) { e.hp -= this.power; s.life = 0; this.burst(s.x, s.y, "#ffc79c", 5); }
      }
    }
    for (const e of this.enemies.filter(e => e.hp <= 0)) {
      this.score += e.kind === 2 ? 2500 : 100;
      this.burst(e.x, e.y, e.kind === 2 ? "#c8a2ff" : "#ff8d79", 24);
      if (Math.random() < 0.22) this.pickups.push({ x: e.x, y: e.y });
      if (e.kind === 2 && this.player.hp > 0) this.phase = "won";
    }
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.shots = this.shots.filter(s => s.life > 0);
    this.pickups = this.pickups.filter(p => {
      if (distance(p, this.player) < 30) { this.player.hp = Math.min(100, this.player.hp + 20); return false; }
      return true;
    });
    for (const p of this.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }
    this.particles = this.particles.filter(p => p.life > 0).slice(-220);
  }
  hurt(amount: number) {
    if (this.player.invincible > 0) return;
    this.player.hp = Math.max(0, this.player.hp - amount);
    this.player.invincible = 0.8;
    this.burst(this.player.x, this.player.y, "#ff6c80", 12);
    if (!this.player.hp) this.phase = "lost";
  }
  draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = "#080e1b"; ctx.fillRect(0, 0, w, h);
    ctx.save(); ctx.translate(w / 2 - this.camera.x, h / 2 - this.camera.y);
    ctx.strokeStyle = "#17243a"; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let n = 0; n <= WORLD; n += 70) { ctx.moveTo(n, 0); ctx.lineTo(n, WORLD); ctx.moveTo(0, n); ctx.lineTo(WORLD, n); }
    ctx.stroke();
    // Procedural circuit islands give each sector a recognizable landscape.
    for (let i = 0; i < 35; i++) {
      const x = 110 + (i * 337) % 1860, y = 110 + (i * 571) % 1860;
      if (relays.some(r => distance(r, { x, y }) < 170)) continue;
      ctx.fillStyle = "#101e31"; ctx.strokeStyle = "#233854";
      ctx.fillRect(x, y, 60 + i % 3 * 20, 35); ctx.strokeRect(x, y, 60 + i % 3 * 20, 35);
      ctx.fillStyle = i % 4 === 0 ? "#4b678d" : "#263e5b"; ctx.fillRect(x + 6, y + 6, 4, 23);
    }
    ctx.strokeStyle = "#3d5273"; ctx.lineWidth = 3; ctx.strokeRect(15, 15, WORLD - 30, WORLD - 30);
    relays.forEach((r, i) => {
      const done = this.charge[i] >= 100, color = done ? "#9af5ad" : "#7bafff";
      const glow = ctx.createRadialGradient(r.x, r.y, 10, r.x, r.y, 150);
      glow.addColorStop(0, done ? "#69fa9e24" : "#688dff22"); glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow; ctx.fillRect(r.x - 150, r.y - 150, 300, 300);
      ctx.strokeStyle = "#294163"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, 100, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(r.x, r.y, 100, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.charge[i] / 100); ctx.stroke();
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(Math.PI / 4); ctx.fillStyle = "#12223a"; ctx.fillRect(-28, -28, 56, 56); ctx.strokeStyle = color; ctx.strokeRect(-28, -28, 56, 56); ctx.fillStyle = color; ctx.fillRect(-8, -8, 16, 16); ctx.restore();
      ctx.textAlign = "center"; ctx.font = "12px monospace"; ctx.fillStyle = color; ctx.fillText(r.name, r.x, r.y - 125);
      ctx.fillStyle = "#9eafc8"; ctx.fillText(done ? "ONLINE" : this.charge[i] > 0 ? Math.floor(this.charge[i]) + "%" : "HOLD POSITION TO RESTORE", r.x, r.y + 135);
    });
    for (const p of this.pickups) { ctx.fillStyle = "#97f6bc"; ctx.fillRect(p.x - 9, p.y - 3, 18, 6); ctx.fillRect(p.x - 3, p.y - 9, 6, 18); }
    for (const s of this.shots) {
      ctx.strokeStyle = s.hostile ? "#ff847d" : "#97eeff"; ctx.lineWidth = s.hostile ? 5 : 3;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 0.018, s.y - s.vy * 0.018); ctx.stroke();
    }
    for (const e of this.enemies) {
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(Math.atan2(this.player.y - e.y, this.player.x - e.x));
      const size = e.kind === 2 ? 38 : 17;
      ctx.fillStyle = e.kind === 2 ? "#4c2a72" : "#4d2634"; ctx.strokeStyle = e.kind === 2 ? "#cba1ff" : "#ff8d88"; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; ctx.lineTo(Math.cos(a) * size, Math.sin(a) * size); } ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.fillRect(0, -3, size + 7, 6); ctx.restore();
      if (e.kind === 2) { ctx.fillStyle = "#30223e"; ctx.fillRect(e.x - 55, e.y - 60, 110, 5); ctx.fillStyle = "#cba1ff"; ctx.fillRect(e.x - 55, e.y - 60, 110 * e.hp / e.max, 5); }
    }
    ctx.save(); ctx.translate(this.player.x, this.player.y); ctx.rotate(this.player.angle);
    ctx.shadowColor = "#79dfff"; ctx.shadowBlur = this.reduced ? 0 : 18; ctx.fillStyle = this.player.invincible > 0 ? "#fff" : "#a4eaff";
    ctx.beginPath(); ctx.moveTo(23, 0); ctx.lineTo(-14, -13); ctx.lineTo(-7, 0); ctx.lineTo(-14, 13); ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = "#466cfa"; ctx.fillRect(-19, -5, 7, 10); ctx.restore();
    for (const p of this.particles) { ctx.globalAlpha = Math.min(1, p.life * 2); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 3, 3); } ctx.globalAlpha = 1;
    ctx.restore();
    // Off-screen relay direction markers.
    relays.forEach((r, i) => {
      if (this.charge[i] >= 100) return;
      const x = r.x - this.camera.x + w / 2, y = r.y - this.camera.y + h / 2;
      if (x > 40 && x < w - 40 && y > 60 && y < h - 60) return;
      const px = clamp(x, 35, w - 35), py = clamp(y, 85, h - 120);
      ctx.fillStyle = "#9ebeff"; ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
      ctx.font = "10px monospace"; ctx.textAlign = px > w / 2 ? "right" : "left"; ctx.fillText(r.name, px, py - 15);
    });
    // A compact world map stays readable at mobile widths.
    const size = 94, mx = w - size - 18, my = h - size - 18;
    ctx.fillStyle = "#080e1be8"; ctx.fillRect(mx, my, size, size); ctx.strokeStyle = "#32425e"; ctx.strokeRect(mx, my, size, size);
    relays.forEach((r, i) => { ctx.fillStyle = this.charge[i] >= 100 ? "#a1ffb6" : "#7bafff"; ctx.fillRect(mx + r.x / WORLD * size - 3, my + r.y / WORLD * size - 3, 6, 6); });
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(mx + this.player.x / WORLD * size, my + this.player.y / WORLD * size, 3, 0, Math.PI * 2); ctx.fill();
  }
}
