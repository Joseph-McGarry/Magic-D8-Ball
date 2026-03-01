import * as Notifications from "expo-notifications";
import { applyReminderOffset, isPast } from "../utils/time";

export type ReminderOffset = "none" | "1h" | "3h" | "1d";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function ensurePermissions() {
  const perms = await Notifications.getPermissionsAsync();
  if (perms.status === "granted") return { ok: true as const };
  const req = await Notifications.requestPermissionsAsync();
  return { ok: req.status === "granted" };
}

export async function schedulePlanNotification(
  planId: string,
  title: string,
  scheduledAtIso: string,
  offset: ReminderOffset
): Promise<{ ok: true; notificationId: string } | { ok: false; reason: string }> {
  if (offset === "none") return { ok: false, reason: "NO_OFFSET" };

  const whenIso = applyReminderOffset(scheduledAtIso, offset);
  if (isPast(whenIso)) return { ok: false, reason: "IN_PAST" };

  const perm = await ensurePermissions();
  if (!perm.ok) return { ok: false, reason: "NO_PERMISSION" };

  const triggerDate = new Date(whenIso);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Upcoming date",
      body: title,
      data: { planId },
    },
    trigger: triggerDate,
  });

  return { ok: true, notificationId };
}

export async function cancelPlanNotification(notificationId: string) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}
