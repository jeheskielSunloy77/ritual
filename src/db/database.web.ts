import { Habit, HabitLog } from './types';

const DB_NAME = 'RitualDB';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (e) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('habits')) {
        db.createObjectStore('habits', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('logs')) {
        const store = db.createObjectStore('logs', { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('habit_id', 'habit_id', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function initDatabase(): Promise<void> {
  const db = await getDB();
  
  // Check if we need to seed defaults
  const habits = await getHabits();
  if (habits.length === 0) {
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
      await saveHabit(habit);
    }
  }
}

export async function getHabits(): Promise<Habit[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('habits', 'readonly');
    const store = transaction.objectStore('habits');
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort by created_at ascending
      const result = request.result as Habit[];
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      resolve(result);
    };
    
    request.onerror = () => reject(request.error);
  });
}

export async function saveHabit(habit: Habit): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('habits', 'readwrite');
    const store = transaction.objectStore('habits');
    const request = store.put(habit);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['habits', 'logs'], 'readwrite');
    
    // Delete the habit
    const habitStore = transaction.objectStore('habits');
    habitStore.delete(id);

    // Delete corresponding logs (we do this by opening a cursor or manually filtering)
    const logStore = transaction.objectStore('logs');
    const index = logStore.index('habit_id');
    const request = index.openCursor(IDBKeyRange.only(id));

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function logHabitProgress(log: HabitLog): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('logs', 'readwrite');
    const store = transaction.objectStore('logs');
    
    // Ensure the ID is uniquely determined by habit_id and date for easy upserting
    const logData = {
      ...log,
      id: `${log.habit_id}_${log.date}`,
    };
    
    const request = store.put(logData);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getLogsForDate(date: string): Promise<HabitLog[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('logs', 'readonly');
    const store = transaction.objectStore('logs');
    const index = store.index('date');
    const request = index.getAll(IDBKeyRange.only(date));

    request.onsuccess = () => resolve(request.result as HabitLog[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllLogs(): Promise<HabitLog[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('logs', 'readonly');
    const store = transaction.objectStore('logs');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result as HabitLog[]);
    request.onerror = () => reject(request.error);
  });
}
