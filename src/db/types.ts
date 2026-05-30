export interface Habit {
  id: string;
  title: string;
  subtitle: string;
  frequency: string; // 'daily' | 'weekdays' | 'weekends'
  icon: string;      // material symbol name
  color: 'primary' | 'secondary' | 'tertiary';
  target_type: 'boolean' | 'counter';
  target_value: number; // e.g. 1 for boolean, 8 for water glasses
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  value: number;
  completed: boolean;
  created_at: string;
}
