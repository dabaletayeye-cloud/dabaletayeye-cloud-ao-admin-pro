import { useState } from 'react';
import { MOCK_TODOS, type TodoItem } from '../data/mockData';
import { PlusIcon, TrashIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

const PRIORITY_CONFIG = {
  high: { label: '高', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
  medium: { label: '中', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  low: { label: '低', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
};

export default function TodoList() {
  const { themeState } = useTheme();
  const { t } = useTranslation();
  const isManga = themeState.themeId === 'manga';

  const [todos, setTodos] = useState<TodoItem[]>(MOCK_TODOS);
  const [newText, setNewText] = useState('');

  const toggle = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const remove = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const add = () => {
    if (!newText.trim()) return;
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text: newText.trim(), done: false, priority: 'medium' }
    ]);
    setNewText('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') add();
  };

  const done = todos.filter(t => t.done).length;
  const total = todos.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div data-cmp="TodoList" className="flex flex-col h-full">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {done}/{total} {t('dashboard.completed')}
          </span>
          <span className="text-xs font-bold" style={{ color: 'var(--primary)' }}>{pct}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 mb-3" style={{ maxHeight: 240 }}>
        {todos.map(todo => {
          const cfg = PRIORITY_CONFIG[todo.priority];
          return (
            <div
              key={todo.id}
              className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-accent transition-colors group"
            >
              {/* Checkbox */}
              <button
                onClick={() => toggle(todo.id)}
                className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  borderColor: todo.done ? 'var(--primary)' : 'var(--border)',
                  background: todo.done ? 'var(--primary)' : 'transparent',
                }}
              >
                {todo.done && <span className="text-white" style={{ fontSize: 10, lineHeight: 1 }}>✓</span>}
              </button>

              {/* Text */}
              <span
                className="flex-1 text-sm"
                style={{
                  color: todo.done ? 'var(--muted-foreground)' : 'var(--foreground)',
                  textDecoration: todo.done ? 'line-through' : 'none',
                }}
              >
                {t(`dashboard.todo${todo.id}`, { defaultValue: todo.text })}
              </span>

              {/* Priority badge */}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full flex-shrink-0"
                style={{ background: cfg.bg, color: cfg.color, fontWeight: 600 }}
              >
                {t(`dashboard.priority${todo.priority.charAt(0).toUpperCase()}${todo.priority.slice(1)}`, { defaultValue: cfg.label })}
              </span>

              {/* Delete */}
              <button
                onClick={() => remove(todo.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <TrashIcon size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newText}
          onChange={e => setNewText(e.target.value)}
          onKeyDown={handleKey}
          placeholder={t('dashboard.addTodo')}
          className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
          style={{
            background: 'var(--muted)',
            borderColor: 'var(--border)',
            color: 'var(--foreground)',
          }}
        />
        <button
          onClick={add}
          className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-all ${isManga ? 'manga-glow-btn' : ''}`}
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground)',
          }}
        >
          <PlusIcon size={14} />
          {t('dashboard.add')}
        </button>
      </div>
    </div>
  );
}
