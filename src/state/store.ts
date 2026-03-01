import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SEED_IDEAS } from "../data/seedIdeas";
import { CATEGORIES } from "../data/categories";
import { ACHIEVEMENTS, AchievementId } from "../data/achievements";
import { nowIso, startOfDayIso } from "../utils/time";
import { pickIdeasFromPool } from "../utils/random";
import { makeId } from "../utils/ids";
import { schedulePlanNotification, cancelPlanNotification } from "../notifications/notifications";

export type ThemeId =
  | "neonViolet"
  | "neonCyan"
  | "neonMagenta"
  | "neonLime"
  | "neonSunset"
  | "neonMono";

export type ReminderOffset = "none" | "1h" | "3h" | "1d";

export type Idea = {
  id: string;
  title: string;
  category: string;
  isCustom: boolean;
};

export type RollResult = {
  rolledAtIso: string;
  ideaIds: string[];
};

export type HistoryItem = {
  ideaId: string;
  lastRolledAtIso: string;
  includeInPool: boolean;
  timesRolled: number;
};

export type Plan = {
  id: string;
  title: string;
  ideaId?: string;
  scheduledAtIso: string;
  reminderOffset: ReminderOffset;
  notes?: string;
  notificationId?: string;
  createdAtIso: string;
  completedAtIso?: string;
};

export type AchievementState = {
  id: AchievementId;
  unlocked: boolean;
  unlockedAtIso?: string;
};

type AppSettings = {
  rollCount: 1 | 2;
  themeId: ThemeId;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  shakeSensitivity: number; // 1..5
  notificationsEnabled: boolean;
  defaultReminderOffset: ReminderOffset;

  // Face Off additions
  faceOffMode: boolean;
  yourName: string;
  partnerName: string;

  // Hidden usage stats to support achievements (not shown in UI)
  _stats: {
    totalRolls: number;
    totalFaceOffs: number;
    totalSaves: number;
    totalCustomAdded: number;
    totalPlansRescheduled: number;
    totalRemindersScheduled: number;
    daysUsed: Record<string, boolean>;
    themesUsed: Record<string, boolean>;
    lastRollAtIso?: string;
  };
};

type Filters = {
  categoriesEnabled: Record<string, boolean>;
  includeCustomIdeas: boolean;
};

type AppState = {
  hydrated: boolean;

  settings: AppSettings;
  filters: Filters;

  customIdeas: Idea[];
  history: Record<string, HistoryItem>;
  rolls: RollResult[];
  plans: Plan[];

  achievements: Record<AchievementId, AchievementState>;
  lastAchievementToast?: { id: AchievementId; title: string; flavor?: string; icon: string };

  // selectors
  getAllIdeas: () => Idea[];
  getIdeaById: (id: string) => Idea | undefined;
  getPoolIdeas: () => Idea[];

  // actions
  hydrate: () => Promise<void>;

  setTheme: (id: ThemeId) => void;
  setRollCount: (count: 1 | 2) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDefaultReminderOffset: (offset: ReminderOffset) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setShakeSensitivity: (value: number) => void;
  setFaceOffMode: (enabled: boolean) => void;
  setYourName: (name: string) => void;
  setPartnerName: (name: string) => void;

  toggleCategory: (category: string) => void;
  setIncludeCustomIdeas: (enabled: boolean) => void;

  addCustomIdea: (title: string) => void;
  deleteCustomIdea: (id: string) => void;

  toggleHistoryInclude: (ideaId: string) => void;

  roll: () => { ideas: Idea[]; rollResult: RollResult } | { error: "EMPTY_POOL" | "INSUFFICIENT_POOL" };
  recordFaceOff: () => void;

  savePlan: (input: { idea: Idea; scheduledAtIso: string; reminderOffset: ReminderOffset; notes?: string }) => Promise<void>;
  reschedulePlan: (planId: string, scheduledAtIso: string, reminderOffset: ReminderOffset) => Promise<void>;
  togglePlanDone: (planId: string) => void;
  deletePlan: (planId: string) => Promise<void>;
  cancelPlanReminder: (planId: string) => Promise<void>;

  clearAchievementToast: () => void;
};

const defaultCategoriesEnabled: Record<string, boolean> = Object.fromEntries(
  CATEGORIES.map((c) => [c, true])
);

function initAchievements(): Record<AchievementId, AchievementState> {
  const map = {} as Record<AchievementId, AchievementState>;
  for (const a of ACHIEVEMENTS) {
    map[a.id] = { id: a.id, unlocked: false };
  }
  return map;
}

const STORAGE_KEY = "magic-d8ball-appstate-v1";

const initialSettings: AppSettings = {
  rollCount: 1,
  themeId: "neonViolet",
  soundEnabled: true,
  hapticsEnabled: true,
  shakeSensitivity: 3,
  notificationsEnabled: true,
  defaultReminderOffset: "none",
  faceOffMode: false,
  yourName: "",
  partnerName: "",
  _stats: {
    totalRolls: 0,
    totalFaceOffs: 0,
    totalSaves: 0,
    totalCustomAdded: 0,
    totalPlansRescheduled: 0,
    totalRemindersScheduled: 0,
    daysUsed: { [startOfDayIso(nowIso())]: true },
    themesUsed: { neonViolet: true },
  },
};

const initialFilters: Filters = {
  categoriesEnabled: defaultCategoriesEnabled,
  includeCustomIdeas: true,
};

function unlock(set: any, get: any, id: AchievementId) {
  const st = get().achievements[id];
  if (st?.unlocked) return;

  const meta = ACHIEVEMENTS.find((a) => a.id === id);
  set((s: AppState) => ({
    achievements: {
      ...s.achievements,
      [id]: { id, unlocked: true, unlockedAtIso: nowIso() },
    },
    lastAchievementToast: meta ? { id: meta.id, title: meta.title, flavor: meta.flavor, icon: meta.icon } : undefined,
  }));
}

function evaluateAchievements(set: any, get: any) {
  const s: AppState = get();
  const stats = s.settings._stats;
  const unlocked = s.achievements;

  // Keep criteria internal. UI shows only unlock results.
  const rolls = stats.totalRolls;
  const saves = stats.totalSaves;
  const customs = stats.totalCustomAdded;
  const faceoffs = stats.totalFaceOffs;

  const daysUsedCount = Object.keys(stats.daysUsed).length;
  const themesUsedCount = Object.keys(stats.themesUsed).length;
  const historyCount = Object.keys(s.history).length;
  const excludedCount = Object.values(s.history).filter((h) => !h.includeInPool).length;

  // Time-based flavors
  const last = stats.lastRollAtIso ? new Date(stats.lastRollAtIso) : null;
  const hour = last ? last.getHours() : null;

  if (!unlocked.first_roll.unlocked && rolls >= 1) unlock(set, get, "first_roll");
  if (!unlocked.three_rolls.unlocked && rolls >= 3) unlock(set, get, "three_rolls");
  if (!unlocked.ten_rolls.unlocked && rolls >= 10) unlock(set, get, "ten_rolls");

  if (!unlocked.save_one.unlocked && saves >= 1) unlock(set, get, "save_one");
  if (!unlocked.save_five.unlocked && saves >= 5) unlock(set, get, "save_five");
  if (!unlocked.save_ten.unlocked && saves >= 10) unlock(set, get, "save_ten");

  if (!unlocked.custom_one.unlocked && customs >= 1) unlock(set, get, "custom_one");
  if (!unlocked.custom_five.unlocked && customs >= 5) unlock(set, get, "custom_five");

  if (!unlocked.faceoff_one.unlocked && faceoffs >= 1) unlock(set, get, "faceoff_one");
  if (!unlocked.faceoff_five.unlocked && faceoffs >= 5) unlock(set, get, "faceoff_five");

  if (!unlocked.exclude_one.unlocked && excludedCount >= 1) unlock(set, get, "exclude_one");
  if (!unlocked.exclude_five.unlocked && excludedCount >= 5) unlock(set, get, "exclude_five");

  if (!unlocked.history_hoarder.unlocked && historyCount >= 25) unlock(set, get, "history_hoarder");

  if (!unlocked.streak_two_days.unlocked && daysUsedCount >= 2) unlock(set, get, "streak_two_days");
  if (!unlocked.streak_seven_days.unlocked && daysUsedCount >= 7) unlock(set, get, "streak_seven_days");

  if (!unlocked.theme_two.unlocked && themesUsedCount >= 2) unlock(set, get, "theme_two");
  if (!unlocked.theme_all.unlocked && themesUsedCount >= 6) unlock(set, get, "theme_all");

  if (!unlocked.late_night.unlocked && hour !== null && (hour === 0 || hour === 1 || hour === 2)) unlock(set, get, "late_night");
  if (!unlocked.early_bird.unlocked && hour !== null && (hour === 6 || hour === 7)) unlock(set, get, "early_bird");

  // These category "bias" achievements are based on history timesRolled.
  const countsByCat: Record<string, number> = {};
  for (const h of Object.values(s.history)) {
    const idea = s.getIdeaById(h.ideaId);
    if (!idea) continue;
    countsByCat[idea.category] = (countsByCat[idea.category] ?? 0) + h.timesRolled;
  }
  if (!unlocked.cozy_bias.unlocked && (countsByCat["Cozy / Stay-In"] ?? 0) >= 12) unlock(set, get, "cozy_bias");
  if (!unlocked.outdoor_bias.unlocked && (countsByCat["Outdoors / Nature"] ?? 0) >= 12) unlock(set, get, "outdoor_bias");
  if (!unlocked.culture_bias.unlocked && (countsByCat["Culture & Events"] ?? 0) >= 10) unlock(set, get, "culture_bias");

  // Filter tweak: if any category off or includeCustom off
  const enabledCount = Object.values(s.filters.categoriesEnabled).filter(Boolean).length;
  if (!unlocked.filter_tweak.unlocked && (enabledCount < CATEGORIES.length || !s.filters.includeCustomIdeas)) unlock(set, get, "filter_tweak");

  // Reminder on: if any plan has notificationId
  const hasReminder = s.plans.some((p) => !!p.notificationId);
  if (!unlocked.reminder_on.unlocked && hasReminder) unlock(set, get, "reminder_on");

  // Reschedule
  if (!unlocked.reschedule_one.unlocked && stats.totalPlansRescheduled >= 1) unlock(set, get, "reschedule_one");
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      hydrated: false,

      settings: initialSettings,
      filters: initialFilters,

      customIdeas: [],
      history: {},
      rolls: [],
      plans: [],

      achievements: initAchievements(),

      getAllIdeas: () => {
        const custom = get().customIdeas;
        const seed: Idea[] = SEED_IDEAS.map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          isCustom: false,
        }));
        return [...seed, ...custom];
      },

      getIdeaById: (id) => get().getAllIdeas().find((i) => i.id === id),

      getPoolIdeas: () => {
        const { filters, history } = get();
        const all = get().getAllIdeas();
        return all.filter((idea) => {
          if (idea.isCustom) {
            if (!filters.includeCustomIdeas) return false;
          } else {
            if (!filters.categoriesEnabled[idea.category]) return false;
          }
          const h = history[idea.id];
          if (h && h.includeInPool === false) return false;
          return true;
        });
      },

      hydrate: async () => {
        set({ hydrated: true });
      },

      setTheme: (id) =>
        set((s) => {
          const day = startOfDayIso(nowIso());
          const themesUsed = { ...s.settings._stats.themesUsed, [id]: true };
          return {
            settings: {
              ...s.settings,
              themeId: id,
              _stats: { ...s.settings._stats, themesUsed, daysUsed: { ...s.settings._stats.daysUsed, [day]: true } },
            },
          };
        }),

      setRollCount: (count) => set((s) => ({ settings: { ...s.settings, rollCount: count } })),
      setNotificationsEnabled: (enabled) => set((s) => ({ settings: { ...s.settings, notificationsEnabled: enabled } })),
      setDefaultReminderOffset: (offset) => set((s) => ({ settings: { ...s.settings, defaultReminderOffset: offset } })),
      setSoundEnabled: (enabled) => set((s) => ({ settings: { ...s.settings, soundEnabled: enabled } })),
      setHapticsEnabled: (enabled) => set((s) => ({ settings: { ...s.settings, hapticsEnabled: enabled } })),
      setShakeSensitivity: (value) => set((s) => ({ settings: { ...s.settings, shakeSensitivity: value } })),
      setFaceOffMode: (enabled) => set((s) => ({ settings: { ...s.settings, faceOffMode: enabled } })),
      setYourName: (name) => set((s) => ({ settings: { ...s.settings, yourName: name } })),
      setPartnerName: (name) => set((s) => ({ settings: { ...s.settings, partnerName: name } })),

      toggleCategory: (category) =>
        set((s) => ({
          filters: {
            ...s.filters,
            categoriesEnabled: {
              ...s.filters.categoriesEnabled,
              [category]: !s.filters.categoriesEnabled[category],
            },
          },
        })),

      setIncludeCustomIdeas: (enabled) => set((s) => ({ filters: { ...s.filters, includeCustomIdeas: enabled } })),

      addCustomIdea: (title) => {
        const trimmed = title.trim();
        if (!trimmed) return;
        const id = makeId("custom");
        set((s) => ({
          customIdeas: [{ id, title: trimmed, category: "Custom", isCustom: true }, ...s.customIdeas],
          settings: {
            ...s.settings,
            _stats: { ...s.settings._stats, totalCustomAdded: s.settings._stats.totalCustomAdded + 1 },
          },
        }));
        evaluateAchievements(set, get);
      },

      deleteCustomIdea: (id) => set((s) => ({ customIdeas: s.customIdeas.filter((c) => c.id !== id) })),

      toggleHistoryInclude: (ideaId) =>
        set((s) => {
          const current = s.history[ideaId];
          if (!current) {
            // Idea has never been rolled; create an excluded entry with a sentinel timestamp
            return {
              history: {
                ...s.history,
                [ideaId]: { ideaId, lastRolledAtIso: "1970-01-01T00:00:00.000Z", includeInPool: false, timesRolled: 0 },
              },
            };
          }
          return { history: { ...s.history, [ideaId]: { ...current, includeInPool: !current.includeInPool } } };
        }),

      roll: () => {
        const pool = get().getPoolIdeas();
        const rollCount = get().settings.faceOffMode ? 2 : get().settings.rollCount;

        if (pool.length === 0) return { error: "EMPTY_POOL" as const };
        if (rollCount === 2 && pool.length < 2) return { error: "INSUFFICIENT_POOL" as const };

        const ideas = pickIdeasFromPool(pool, rollCount);
        const rolledAtIso = nowIso();
        const rollResult: RollResult = { rolledAtIso, ideaIds: ideas.map((i) => i.id) };

        set((s) => {
          const nextHistory = { ...s.history };
          for (const idea of ideas) {
            const prev = nextHistory[idea.id];
            nextHistory[idea.id] = {
              ideaId: idea.id,
              lastRolledAtIso: rolledAtIso,
              includeInPool: prev ? prev.includeInPool : true,
              timesRolled: (prev?.timesRolled ?? 0) + 1,
            };
          }

          const day = startOfDayIso(rolledAtIso);

          return {
            rolls: [rollResult, ...s.rolls].slice(0, 200),
            history: nextHistory,
            settings: {
              ...s.settings,
              _stats: {
                ...s.settings._stats,
                totalRolls: s.settings._stats.totalRolls + 1,
                daysUsed: { ...s.settings._stats.daysUsed, [day]: true },
                lastRollAtIso: rolledAtIso,
              },
            },
          };
        });

        evaluateAchievements(set, get);
        return { ideas, rollResult };
      },

      recordFaceOff: () => {
        set((s) => ({
          settings: { ...s.settings, _stats: { ...s.settings._stats, totalFaceOffs: s.settings._stats.totalFaceOffs + 1 } },
        }));
        evaluateAchievements(set, get);
      },

      savePlan: async ({ idea, scheduledAtIso, reminderOffset, notes }) => {
        const planId = makeId("plan");
        const plan: Plan = {
          id: planId,
          title: idea.title,
          ideaId: idea.id,
          scheduledAtIso,
          reminderOffset,
          notes,
          createdAtIso: nowIso(),
        };

        set((s) => ({
          plans: [plan, ...s.plans],
          settings: { ...s.settings, _stats: { ...s.settings._stats, totalSaves: s.settings._stats.totalSaves + 1 } },
        }));
        evaluateAchievements(set, get);

        const { settings } = get();
        if (!settings.notificationsEnabled || reminderOffset === "none") return;

        const res = await schedulePlanNotification(planId, plan.title, scheduledAtIso, reminderOffset);
        if (res.ok) {
          set((s) => ({
            plans: s.plans.map((p) => (p.id === planId ? { ...p, notificationId: res.notificationId } : p)),
            settings: { ...s.settings, _stats: { ...s.settings._stats, totalRemindersScheduled: s.settings._stats.totalRemindersScheduled + 1 } },
          }));
          evaluateAchievements(set, get);
        }
      },

      reschedulePlan: async (planId, scheduledAtIso, reminderOffset) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return;

        if (plan.notificationId) await cancelPlanNotification(plan.notificationId);

        set((s) => ({
          plans: s.plans.map((p) => (p.id === planId ? { ...p, scheduledAtIso, reminderOffset, notificationId: undefined } : p)),
          settings: { ...s.settings, _stats: { ...s.settings._stats, totalPlansRescheduled: s.settings._stats.totalPlansRescheduled + 1 } },
        }));
        evaluateAchievements(set, get);

        const { settings } = get();
        if (!settings.notificationsEnabled || reminderOffset === "none") return;

        const res = await schedulePlanNotification(planId, plan.title, scheduledAtIso, reminderOffset);
        if (res.ok) {
          set((s) => ({
            plans: s.plans.map((p) => (p.id === planId ? { ...p, notificationId: res.notificationId } : p)),
            settings: { ...s.settings, _stats: { ...s.settings._stats, totalRemindersScheduled: s.settings._stats.totalRemindersScheduled + 1 } },
          }));
          evaluateAchievements(set, get);
        }
      },

      togglePlanDone: (planId) =>
        set((s) => ({
          plans: s.plans.map((p) =>
            p.id === planId ? { ...p, completedAtIso: p.completedAtIso ? undefined : nowIso() } : p
          ),
        })),

      deletePlan: async (planId) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return;
        if (plan.notificationId) await cancelPlanNotification(plan.notificationId);
        set((s) => ({ plans: s.plans.filter((p) => p.id !== planId) }));
      },

      cancelPlanReminder: async (planId) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan?.notificationId) return;
        await cancelPlanNotification(plan.notificationId);
        set((s) => ({
          plans: s.plans.map((p) => (p.id === planId ? { ...p, notificationId: undefined, reminderOffset: "none" } : p)),
        }));
      },

      clearAchievementToast: () => set({ lastAchievementToast: undefined }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        filters: s.filters,
        customIdeas: s.customIdeas,
        history: s.history,
        rolls: s.rolls,
        plans: s.plans,
        achievements: s.achievements,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
