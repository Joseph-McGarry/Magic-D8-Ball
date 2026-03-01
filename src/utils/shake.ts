// Basic shake detection based on acceleration magnitude.
// sensitivity: 1..5 (higher = more sensitive)

export function magnitude(x: number, y: number, z: number) {
  return Math.sqrt(x * x + y * y + z * z);
}

export function thresholdForSensitivity(sensitivity: number) {
  // Tuned for Expo accelerometer on typical devices.
  // Higher sensitivity => lower threshold.
  const s = Math.max(1, Math.min(5, sensitivity));
  const map = { 1: 2.3, 2: 2.0, 3: 1.7, 4: 1.45, 5: 1.25 } as const;
  return map[s as 1 | 2 | 3 | 4 | 5];
}
