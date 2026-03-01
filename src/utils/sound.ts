import { Audio } from "expo-av";

// Very small base64 WAV "tick" (subtle). You can swap later with a real whoosh asset.
const TICK_WAV_BASE64 =
  "UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=";

export async function playTick() {
  const sound = new Audio.Sound();
  try {
    await sound.loadAsync({ uri: `data:audio/wav;base64,${TICK_WAV_BASE64}` });
    await sound.setVolumeAsync(0.35);
    await sound.playAsync();
    // unload shortly after
    setTimeout(() => sound.unloadAsync().catch(() => {}), 1200);
  } catch {
    try { await sound.unloadAsync(); } catch {}
  }
}
