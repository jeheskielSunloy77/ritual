import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Habit, HabitLog } from '../db/types';
import * as db from '../db/database';

export interface RichHabit extends Habit {
  current_progress: number;
  completed: boolean;
  streak: number;
}

interface HabitsContextType {
  habits: RichHabit[];
  loading: boolean;
  currentDate: string;
  changeDate: (dateStr: string) => void;
  toggleHabit: (habitId: string, increment?: boolean) => Promise<void>;
  addHabit: (title: string, subtitle: string, frequency: string, icon: string, color: 'primary' | 'secondary' | 'tertiary', target_type: 'boolean' | 'counter', target_value: number) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  weeklyProgress: { day: string; percentage: number; isToday: boolean }[];
  streakStats: {
    currentStreak: number;
    completionRate: number;
  };
  refreshData: () => Promise<void>;
  username: string;
  avatarUri: string;
  updateProfile: (username: string, avatarUri: string) => Promise<void>;
}

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

// Helper to format date as YYYY-MM-DD in local time
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getWeekDates(todayStr: string): string[] {
  const today = new Date(todayStr);
  const day = today.getDay(); // 0 is Sunday, 1 is Monday, ...
  // Adjust so Monday is first day of the week
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(getLocalDateString(d));
  }
  return dates;
}

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<RichHabit[]>([]);
  const [allLogs, setAllLogs] = useState<HabitLog[]>([]);
  const [currentDate, setCurrentDate] = useState<string>(getLocalDateString());
  const [loading, setLoading] = useState<boolean>(true);

  const [username, setUsername] = useState<string>('Jay');
  const [avatarUri, setAvatarUri] = useState<string>('');

  // Initialize DB and load data
  useEffect(() => {
    async function setup() {
      try {
        await db.initDatabase();
        const savedUsername = await db.getSetting('username', 'Jay');
        const savedAvatarUri = await db.getSetting('avatar_uri', '');
        setUsername(savedUsername);
        setAvatarUri(savedAvatarUri);
        await loadData();
      } catch (err) {
        console.error('Error initializing database:', err);
        setLoading(false);
      }
    }
    setup();
  }, []);

  // Reload data when date changes
  useEffect(() => {
    if (!loading) {
      loadData();
    }
  }, [currentDate]);

  async function loadData() {
    try {
      const rawHabits = await db.getHabits();
      const rawLogsForToday = await db.getLogsForDate(currentDate);
      const rawAllLogs = await db.getAllLogs();
      
      setAllLogs(rawAllLogs);

      // Map today's logs to habits
      const richHabits = rawHabits.map(habit => {
        const todayLog = rawLogsForToday.find(l => l.habit_id === habit.id);
        const current_progress = todayLog ? todayLog.value : 0;
        const completed = todayLog ? todayLog.completed : false;
        
        // Calculate streak
        const streak = calculateHabitStreak(habit.id, rawAllLogs, currentDate);

        return {
          ...habit,
          current_progress,
          completed,
          streak,
        };
      });

      setHabits(richHabits);
      setLoading(false);
    } catch (err) {
      console.error('Error loading habits data:', err);
      setLoading(false);
    }
  }

  function calculateHabitStreak(habitId: string, logs: HabitLog[], todayStr: string): number {
    const completedLogs = logs.filter(l => l.habit_id === habitId && l.completed);
    if (completedLogs.length === 0) return 0;

    const completedDates = new Set(completedLogs.map(l => l.date));
    let streak = 0;
    let checkDate = new Date(todayStr);

    const todayCompleted = completedDates.has(todayStr);
    if (!todayCompleted) {
      // If not completed today, check if yesterday was completed. If not, streak is 0.
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = getLocalDateString(checkDate);
      if (completedDates.has(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  function changeDate(dateStr: string) {
    setCurrentDate(dateStr);
  }

  async function toggleHabit(habitId: string, increment: boolean = true) {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const currentProgress = habit.current_progress ?? 0;
    const targetValue = habit.target_value ?? 1;
    const isCompleted = habit.completed ?? false;

    let newValue = currentProgress;
    if (habit.target_type === 'boolean') {
      newValue = isCompleted ? 0 : 1;
    } else {
      if (increment) {
        newValue = Math.min(targetValue, currentProgress + 1);
      } else {
        newValue = Math.max(0, currentProgress - 1);
      }
    }

    const completed = newValue >= targetValue;

    const log: HabitLog = {
      id: `${habitId}_${currentDate}`,
      habit_id: habitId,
      date: currentDate,
      value: typeof newValue === 'number' && !isNaN(newValue) ? newValue : 0,
      completed,
      created_at: new Date().toISOString()
    };

    await db.logHabitProgress(log);
    await loadData();
  }

  async function addHabit(
    title: string,
    subtitle: string,
    frequency: string,
    icon: string,
    color: 'primary' | 'secondary' | 'tertiary',
    target_type: 'boolean' | 'counter',
    target_value: number
  ) {
    const newHabit: Habit = {
      id: `h_${Date.now()}`,
      title,
      subtitle,
      frequency,
      icon,
      color,
      target_type,
      target_value,
      created_at: new Date().toISOString()
    };

    await db.saveHabit(newHabit);
    await loadData();
  }

  async function deleteHabit(habitId: string) {
    await db.deleteHabit(habitId);
    await loadData();
  }

  // Derived Weekly Progress Flow
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDates = getWeekDates(currentDate);
  const todayStr = getLocalDateString();
  
  const weeklyProgress = weekDates.map((date, index) => {
    // Habits active on that day (all habits in our local simplified model)
    const totalHabits = habits.length;
    if (totalHabits === 0) {
      return { day: weekDays[index], percentage: 0, isToday: date === todayStr };
    }

    const completedOnDate = allLogs.filter(l => l.date === date && l.completed).length;
    const percentage = Math.round((completedOnDate / totalHabits) * 100);

    return {
      day: weekDays[index],
      percentage,
      isToday: date === todayStr
    };
  });

  // Derived Overall Stats
  const streakStats = React.useMemo(() => {
    // Current streak is defined as consecutive days where ALL habits were completed
    let currentStreak = 0;
    let checkDate = new Date(todayStr);

    const checkDayFullCompletion = (dateStr: string) => {
      if (habits.length === 0) return false;
      const logsForDate = allLogs.filter(l => l.date === dateStr && l.completed);
      return logsForDate.length === habits.length;
    };

    const todayCompleted = checkDayFullCompletion(todayStr);
    if (!todayCompleted) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = getLocalDateString(checkDate);
      if (checkDayFullCompletion(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    if (todayCompleted) currentStreak++;

    // Completion rate of last 30 days
    let completedCount = 0;
    let totalLogsCount = habits.length * 30;

    for (let i = 0; i < 30; i++) {
      const dateStr = getPastDateString(i);
      const completedOnDate = allLogs.filter(l => l.date === dateStr && l.completed).length;
      completedCount += completedOnDate;
    }

    const completionRate = totalLogsCount > 0 ? Math.round((completedCount / totalLogsCount) * 100) : 0;

    return {
      currentStreak,
      completionRate
    };
  }, [habits, allLogs, todayStr]);

  function getPastDateString(daysAgo: number): string {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return getLocalDateString(d);
  }

  async function updateProfile(newUsername: string, newAvatarUri: string) {
    await db.setSetting('username', newUsername);
    await db.setSetting('avatar_uri', newAvatarUri);
    setUsername(newUsername);
    setAvatarUri(newAvatarUri);
  }

  return (
    <HabitsContext.Provider
      value={{
        habits,
        loading,
        currentDate,
        changeDate,
        toggleHabit,
        addHabit,
        deleteHabit,
        weeklyProgress,
        streakStats,
        refreshData: loadData,
        username,
        avatarUri,
        updateProfile
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}
