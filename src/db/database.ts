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

  // Inspect existing schema to handle structural upgrades
  try {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(habits);');
    const columnNames = columns.map(c => c.name);
    const requiredColumns = ['id', 'title', 'subtitle', 'frequency', 'icon', 'color', 'target_type', 'target_value', 'created_at'];
    const hasAllColumns = requiredColumns.every(col => columnNames.includes(col));
    
    if (columnNames.length > 0 && !hasAllColumns) {
      await db.execAsync('DROP TABLE IF EXISTS logs;');
      await db.execAsync('DROP TABLE IF EXISTS habits;');
    }
  } catch (e) {
    console.warn('Error checking habits table schema:', e);
  }
  
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
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

}

export async function getSetting(key: string, defaultValue: string): Promise<string> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [key]);
  return rows.length > 0 ? rows[0].value : defaultValue;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO settings (key, value)
     VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
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
