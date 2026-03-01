export function nowIso() {
  return new Date().toISOString();
}

export function startOfDayIso(iso: string) {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function isPast(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

export function applyReminderOffset(scheduledAtIso: string, offset: "none" | "1h" | "3h" | "1d") {
  const t = new Date(scheduledAtIso).getTime();
  let delta = 0;
  if (offset === "1h") delta = 60 * 60 * 1000;
  if (offset === "3h") delta = 3 * 60 * 60 * 1000;
  if (offset === "1d") delta = 24 * 60 * 60 * 1000;
  return new Date(t - delta).toISOString();
}
