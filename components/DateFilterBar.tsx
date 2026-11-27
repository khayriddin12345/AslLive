'use client';

import { CalendarDays } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export type DatePreset = 'all' | 'today' | 'yesterday' | 'custom';
type Props = { value: string; onChange: (value: string) => void; className?: string };

function localDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateFilterBar({ value, onChange, className = '' }: Props) {
  const { t } = useApp();
  const today = localDateString(new Date());
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateString(yesterdayDate);
  const currentPreset: DatePreset = value === '' ? 'all' : value === today ? 'today' : value === yesterday ? 'yesterday' : 'custom';
  const presets: { key: DatePreset; label: string; date: string }[] = [
    { key: 'all', label: t('dateAll'), date: '' },
    { key: 'today', label: t('today'), date: today },
    { key: 'yesterday', label: t('yesterday'), date: yesterday },
  ];

  return (
    <div className={`flex items-center gap-2 overflow-x-auto px-4 py-2 ${className}`}>
      {presets.map((preset) => (
        <button key={preset.key} type="button" onClick={() => onChange(preset.date)}
          aria-pressed={currentPreset === preset.key}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${currentPreset === preset.key ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-gray-200 bg-white text-gray-600'}`}>
          {preset.label}
        </button>
      ))}
      <label className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${currentPreset === 'custom' ? 'border-emerald-600 text-emerald-700' : 'border-gray-200 text-gray-600'}`}>
        <CalendarDays size={14} aria-hidden="true" />
        <span>{t('pickDate')}</span>
        <input aria-label={t('pickDate')} type="date" value={currentPreset === 'custom' ? value : ''}
          max={today} onChange={(event) => onChange(event.target.value)} className="w-[112px] bg-transparent text-xs outline-none" />
      </label>
    </div>
  );
}

/** Returns local-midnight boundaries encoded as UTC ISO strings for timestamptz queries. */
export function localDayBounds(date: string): { start: string; end: string } | null {
  if (!date) return null;
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return null;
  const start = new Date(year, month - 1, day);
  const end = new Date(year, month - 1, day + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function localDateStringForPicker(date: Date) {
  return localDateString(date);
}
