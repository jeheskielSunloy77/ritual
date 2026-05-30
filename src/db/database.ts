import * as SQLite from 'expo-sqlite';
import { Habit, HabitLog } from './types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('ritual.db');
  }
  return dbPromise;
}

export async function initDatabase(): Promise<void> {
  const db = await getDatabase();
  
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');
  
  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      frequency TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_value INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY NOT NULL,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      value INTEGER NOT NULL,
      completed INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY(habit_id) REFERENCES habits(id) ON DELETE CASCADE,
      UNIQUE(habit_id, date)
    );
  `);
  
  // Seed default habits if empty
  const habitsCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM habits');
  if (habitsCount && habitsCount.count === 0) {
    const defaults: Habit[] = [
      {
        id: 'h1',
        title: 'Hydrate',
        subtitle: 'Drink a glass of water',
        frequency: 'daily',
        icon: 'water_drop',
        color: 'primary',
        target_type: 'counter',
        target_value: 8,
        created_at: new Date().toISOString(),
      },
      {
        id: 'h2',
        title: 'Meditation',
        subtitle: '10 minutes of focus',
        frequency: 'daily',
        icon: 'self_improvement',
        color: 'secondary',
        target_type: 'boolean',
        target_value: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 'h3',
        title: 'Read 10 pages',
        subtitle: 'Current book',
        frequency: 'daily',
        icon: 'menu_book',
        color: 'tertiary',
        target_type: 'boolean',
        target_value: 1,
        created_at: new Date().toISOString(),
      }
    ];

    for (const habit of defaults) {
      await db.runAsync(
        `INSERT INTO habits (id, title, subtitle, frequency, icon, color, target_type, target_value, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          habit.id,
          habit.title,
          habit.subtitle,
          habit.frequency,
          habit.icon,
          habit.color,
          habit.target_type,
          habit.target_value,
          habit.created_at,
        ]
      );
    }
  }
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Habit>('SELECT * FROM habits ORDER BY created_at ASC');
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO habits (id, title, subtitle, frequency, icon, color, target_type, target_value, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       subtitle = excluded.subtitle,
       frequency = excluded.frequency,
       icon = excluded.icon,
       color = excluded.color,
       target_type = excluded.target_type,
       target_value = excluded.target_value`,
    [
      habit.id,
      habit.title,
      habit.subtitle,
      habit.frequency,
      habit.icon,
      habit.color,
      habit.target_type,
      habit.target_value,
      habit.created_at,
    ]
  );
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM habits WHERE id = ?', [id]);
}

export async function logHabitProgress(log: HabitLog): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO logs (id, habit_id, date, value, completed, created_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(habit_id, date) DO UPDATE SET
       value = excluded.value,
       completed = excluded.completed`,
    [log.id, log.habit_id, log.date, log.value, log.completed ? 1 : 0, log.created_at]
  );
}

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; habit_id: string; date: string; value: number; completed: number; created_at: string }>(
    'SELECT * FROM logs WHERE date = ?',
    [date]
  );
  return rows.map(r => ({
    id: r.id,
    habit_id: r.habit_id,
    date: r.date,
    value: r.value,
    completed: r.completed === 1,
    created_at: r.created_at,
  }));
}

export async function getAllLogs(): Promise<HabitLog[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ id: string; habit_id: string; date: string; value: number; completed: number; created_at: string }>(
    'SELECT * FROM logs'
  );
  return rows.map(r => ({
    id: r.id,
    habit_id: r.habit_id,
    date: r.date,
    value: r.value,
    completed: r.completed === 1,
    created_at: r.created_at,
  }));
}
