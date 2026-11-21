export const obstacleProfiles = [
  { name: "Bulkhead", openings: 1, halfGap: .78, radius: 6, color: 0xffa36e },
  { name: "Twin blades", openings: 2, halfGap: .55, radius: 7.5, color: 0xd7a0ff },
  { name: "Triad", openings: 3, halfGap: .42, radius: 5, color: 0xffd475 },
] as const;
export type OrbitGate = { distance: number; angle: number; kind: number };
export function clearsObstacle(angle: number, gate: OrbitGate) {
  const profile = obstacleProfiles[gate.kind];
  const period = Math.PI * 2 / profile.openings;
  const offset = ((angle - gate.angle + period / 2) % period + period) % period - period / 2;
  return Math.abs(offset) <= profile.halfGap - .1;
}
