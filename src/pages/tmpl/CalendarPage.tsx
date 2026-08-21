import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { localizeText } from '../../i18n/localizeText';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  XIcon,
  ClockIcon,
  AlignLeftIcon,
} from 'lucide-react';
import {
  CalEvent,
  EVENT_COLORS,
  getEventsForDate,
  getEventsForMonth,
  getEventsForWeek,
} from '../../api/calendar';

/* ── helpers ────────────────────────────────────────────────── */
function fmtYM(year: number, month: number, language: string) {
  return new Intl.DateTimeFormat(language, { year: 'numeric', month: 'long' }).format(new Date(year, month - 1, 1));
}
function fmtDate(dateStr: string, language: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Intl.DateTimeFormat(language, { month: 'long', day: 'numeric' }).format(new Date(year, month - 1, day));
}
function weekdayLabels(language: string, style: 'narrow' | 'short') {
  return Array.from({ length: 7 }, (_, index) => new Intl.DateTimeFormat(language, { weekday: style }).format(new Date(2024, 0, index + 7)));
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

function startDayOfMonth(y: number, m: number) {
  return new Date(y, m - 1, 1).getDay(); // 0=Sun
}

/** Get the 7 dates of the week containing `date` */
function getWeekDates(y: number, m: number, d: number): string[] {
  const base = new Date(y, m - 1, d);
  const dow = base.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(base);
    dt.setDate(d - dow + i);
    return toDateStr(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
  });
}

/* ── EventDot ────────────────────────────────────────────────── */
function EventDot({ color }: { color: string }) {
  const hex = EVENT_COLORS[color] ?? '#6366f1';
  return (
    <span
      style={{
        display: 'inline-block',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: hex,
        flexShrink: 0,
      }}
    />
  );
}

/* ── EventPill (week view) ───────────────────────────────────── */
function EventPill({ event, onClick, tx }: { event: CalEvent; onClick: () => void; tx: (value: string) => string }) {
  const hex = EVENT_COLORS[event.color] ?? '#6366f1';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        background: hex + '22',
        border: `1px solid ${hex}44`,
        borderLeft: `3px solid ${hex}`,
        borderRadius: 5,
        padding: '3px 7px',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'left',
        marginBottom: 3,
      }}
    >
      <span style={{ fontSize: 11, color: hex, fontWeight: 600, whiteSpace: 'nowrap' }}>
        {event.time}
      </span>
      <span
        style={{
          fontSize: 11,
          color: 'var(--foreground)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}
      >
        {tx(event.title)}
      </span>
    </button>
  );
}

/* ── DayEventModal ───────────────────────────────────────────── */
function DayEventModal({
  dateStr,
  events,
  language,
  tx,
  onClose,
}: {
  dateStr: string;
  events: CalEvent[];
  language: string;
  tx: (value: string) => string;
  onClose: () => void;
}) {
  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.38)',
          zIndex: 1000,
          backdropFilter: 'blur(2px)',
        }}
      />
      {/* panel */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          zIndex: 1001,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          width: 'min(480px, calc(100vw - 32px))',
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow:
            '0 20px 60px rgba(0,0,0,.18), 0 4px 16px rgba(0,0,0,.1)',
          animation: 'cal-modal-in .18s ease',
        }}
      >
        {/* header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px 12px',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>
              {fmtDate(dateStr, language)} {tx('日程')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
              {events.length} {tx('事项')}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted-foreground)',
            }}
          >
            <XIcon size={15} />
          </button>
        </div>
        {/* body */}
        <div style={{ overflowY: 'auto', padding: '12px 20px 20px', flex: 1 }}>
          {events.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--muted-foreground)',
                fontSize: 13,
              }}
            >
              {tx('今天暂无日程安排')}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {events
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(ev => {
                  const hex = EVENT_COLORS[ev.color] ?? '#6366f1';
                  return (
                    <div
                      key={ev.id}
                      style={{
                        borderRadius: 10,
                        border: `1px solid ${hex}33`,
                        background: hex + '0e',
                        padding: '12px 14px',
                        borderLeft: `4px solid ${hex}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: 'var(--foreground)',
                            flex: 1,
                          }}
                        >
                        {tx(ev.title)}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            color: hex,
                            background: hex + '22',
                            borderRadius: 20,
                            padding: '2px 8px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                          }}
                        >
                          <ClockIcon size={10} />
                          {ev.time}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--muted-foreground)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 5,
                          lineHeight: 1.6,
                        }}
                      >
                        <AlignLeftIcon
                          size={12}
                          style={{ marginTop: 2, flexShrink: 0, opacity: 0.6 }}
                        />
                        {tx(ev.desc)}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── MonthView ───────────────────────────────────────────────── */
function MonthView({
  year,
  month,
  todayStr,
  onClickDate,
  tx,
  language,
}: {
  year: number;
  month: number;
  todayStr: string;
  onClickDate: (d: string) => void;
  tx: (value: string) => string;
  language: string;
}) {
  const { themeState } = useTheme();
  const isDark = themeState.mode === 'dark';
  const isManga = themeState.themeId === 'manga';
  const accentHex = isManga ? '#E91E8C' : '#6366f1';

  const evMap = getEventsForMonth(year, month);
  const startDow = startDayOfMonth(year, month);
  const dim = daysInMonth(year, month);

  // Build 6-row × 7-col grid
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const prevDim = daysInMonth(prevYear, prevMonth);

  const cells: { dateStr: string; cur: boolean }[] = [];
  for (let i = 0; i < startDow; i++) {
    const d = prevDim - startDow + 1 + i;
    cells.push({ dateStr: toDateStr(prevYear, prevMonth, d), cur: false });
  }
  for (let d = 1; d <= dim; d++) {
    cells.push({ dateStr: toDateStr(year, month, d), cur: true });
  }
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  let nd = 1;
  while (cells.length < 42) {
    cells.push({ dateStr: toDateStr(nextYear, nextMonth, nd++), cur: false });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* week header */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {weekdayLabels(language, 'narrow').map((l, i) => (
          <div
            key={l}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '8px 0',
              fontSize: 12,
              fontWeight: 600,
              color: i === 0 || i === 6 ? accentHex + 'cc' : 'var(--muted-foreground)',
            }}
          >
            {l}
          </div>
        ))}
      </div>

      {/* day grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', flex: 1 }}>
        {cells.map(({ dateStr, cur }, idx) => {
          const isToday = dateStr === todayStr;
          const dayNum = Number(dateStr.split('-')[2]);
          const dow = idx % 7;
          const isWeekend = dow === 0 || dow === 6;
          const evs = evMap.get(dateStr) ?? [];
          const MAX_DOTS = 4;

          return (
            <div
              key={dateStr}
              onClick={() => onClickDate(dateStr)}
              style={{
                width: `${100 / 7}%`,
                borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                borderBottom: idx < 35 ? '1px solid var(--border)' : 'none',
                padding: '6px 7px 5px',
                cursor: 'pointer',
                minHeight: 80,
                background: isToday
                  ? accentHex + (isDark ? '18' : '0c')
                  : 'transparent',
                transition: 'background .12s',
                position: 'relative',
                boxSizing: 'border-box',
              }}
              onMouseEnter={e => {
                if (!isToday)
                  (e.currentTarget as HTMLElement).style.background = isDark
                    ? 'rgba(255,255,255,.04)'
                    : 'rgba(0,0,0,.025)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = isToday
                  ? accentHex + (isDark ? '18' : '0c')
                  : 'transparent';
              }}
            >
              {/* day number */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  fontSize: 12,
                  fontWeight: isToday ? 700 : 400,
                  background: isToday ? accentHex : 'transparent',
                  color: isToday
                    ? '#fff'
                    : cur
                    ? isWeekend
                      ? accentHex
                      : 'var(--foreground)'
                    : 'var(--muted-foreground)',
                  opacity: cur ? 1 : 0.45,
                  marginBottom: 4,
                }}
              >
                {dayNum}
              </div>

              {/* event dots row */}
              {evs.length > 0 && (
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
                  {evs.slice(0, MAX_DOTS).map(ev => (
                    <EventDot key={ev.id} color={ev.color} />
                  ))}
                  {evs.length > MAX_DOTS && (
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--muted-foreground)',
                        lineHeight: '7px',
                      }}
                    >
                      +{evs.length - MAX_DOTS}
                    </span>
                  )}
                </div>
              )}

              {/* event titles (first 2, only on wider cells) */}
              {evs.slice(0, 2).map(ev => {
                const hex = EVENT_COLORS[ev.color] ?? '#6366f1';
                return (
                  <div
                    key={ev.id}
                    style={{
                      fontSize: 10,
                      background: hex + '1a',
                      borderLeft: `2px solid ${hex}`,
                      borderRadius: '0 3px 3px 0',
                      padding: '1px 4px',
                      marginBottom: 2,
                      color: 'var(--foreground)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tx(ev.title)}
                  </div>
                );
              })}
              {evs.length > 2 && (
                <div
                  style={{ fontSize: 10, color: 'var(--muted-foreground)', paddingLeft: 2 }}
                >
                  +{evs.length - 2} {tx('更多')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── WeekView ────────────────────────────────────────────────── */
function WeekView({
  weekDates,
  todayStr,
  onClickDate,
  tx,
  language,
}: {
  weekDates: string[];
  todayStr: string;
  onClickDate: (d: string, ev: CalEvent) => void;
  tx: (value: string) => string;
  language: string;
}) {
  const { themeState } = useTheme();
  const isDark = themeState.mode === 'dark';
  const isManga = themeState.themeId === 'manga';
  const accentHex = isManga ? '#E91E8C' : '#6366f1';

  const evMap = getEventsForWeek(weekDates);
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 – 21:00

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* header row */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div style={{ width: 52, flexShrink: 0 }} />
        {weekDates.map((ds, i) => {
          const isToday = ds === todayStr;
          const dayNum = Number(ds.split('-')[2]);
          return (
            <div
              key={ds}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 4px',
                borderLeft: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: isToday ? accentHex : 'var(--muted-foreground)',
                  fontWeight: isToday ? 700 : 400,
                  marginBottom: 3,
                }}
              >
                {weekdayLabels(language, 'short')[i]}
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: isToday ? accentHex : 'transparent',
                  fontSize: 14,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday ? '#fff' : 'var(--foreground)',
                }}
              >
                {dayNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* scrollable time grid */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {hours.map(h => (
          <div
            key={h}
            style={{
              display: 'flex',
              borderBottom: '1px solid var(--border)',
              minHeight: 56,
            }}
          >
            {/* hour label */}
            <div
              style={{
                width: 52,
                flexShrink: 0,
                padding: '4px 8px 0 0',
                textAlign: 'right',
                fontSize: 10,
                color: 'var(--muted-foreground)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
            {/* day columns */}
            {weekDates.map(ds => {
              const evs = (evMap.get(ds) ?? []).filter(e => {
                const eh = Number(e.time.split(':')[0]);
                return eh === h;
              });
              return (
                <div
                  key={ds}
                  style={{
                    flex: 1,
                    borderLeft: '1px solid var(--border)',
                    padding: '3px 4px',
                    background:
                      ds === todayStr
                        ? accentHex + (isDark ? '08' : '05')
                        : 'transparent',
                  }}
                >
                  {evs.map(ev => (
                    <EventPill
                      key={ev.id}
                      event={ev}
                      onClick={() => onClickDate(ds, ev)}
                      tx={tx}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── CalendarPage ────────────────────────────────────────────── */
export default function CalendarPage() {
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const tx = useCallback((value: string) => localizeText(value, language), [language]);
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const [view, setView] = useState<'month' | 'week'>('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [weekAnchor, setWeekAnchor] = useState<string>(todayStr);

  // modal
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalEvents, setModalEvents] = useState<CalEvent[]>([]);

  const { themeState } = useTheme();
  const isManga = themeState.themeId === 'manga';
  const accentHex = isManga ? '#E91E8C' : '#6366f1';

  const openDayModal = useCallback((dateStr: string) => {
    setModalDate(dateStr);
    setModalEvents(getEventsForDate(dateStr));
  }, []);

  const openEventModal = useCallback((_dateStr: string, ev: CalEvent) => {
    setModalDate(ev.date);
    setModalEvents(getEventsForDate(ev.date));
  }, []);

  const closeModal = useCallback(() => {
    setModalDate(null);
  }, []);

  // ── navigation ──
  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  function prevWeek() {
    const [wy, wm, wd] = weekAnchor.split('-').map(Number);
    const d = new Date(wy, wm - 1, wd - 7);
    setWeekAnchor(toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }
  function nextWeek() {
    const [wy, wm, wd] = weekAnchor.split('-').map(Number);
    const d = new Date(wy, wm - 1, wd + 7);
    setWeekAnchor(toDateStr(d.getFullYear(), d.getMonth() + 1, d.getDate()));
  }
  function goToday() {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setWeekAnchor(todayStr);
  }

  const weekDates = getWeekDates(
    ...(weekAnchor.split('-').map(Number) as [number, number, number])
  );
  const weekRangeLabel = (() => {
    const s = weekDates[0].split('-');
    const e = weekDates[6].split('-');
    return `${fmtDate(weekDates[0], language)} – ${fmtDate(weekDates[6], language)}`;
  })();

  return (
    <AdminLayout>
      <style>{`
        @keyframes cal-fade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cal-modal-in {
          from { opacity: 0; transform: translate(-50%,-46%) scale(.96); }
          to   { opacity: 1; transform: translate(-50%,-50%) scale(1); }
        }
      `}</style>

      <div
        data-cmp="CalendarPage"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          animation: 'cal-fade .35s ease',
          gap: 16,
        }}
      >
        {/* ── Page title ── */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>
            {tx('日历模板')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            {tx('月视图 · 周视图 · 彩色日程圆点 · 点击查看详情')}
          </p>
        </div>

        {/* ── Calendar card ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 14,
            boxShadow:
              'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,10px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* ── toolbar ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            {/* prev / today / next */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={view === 'month' ? prevMonth : prevWeek}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--foreground)',
                }}
              >
                <ChevronLeftIcon size={15} />
              </button>
              <button
                onClick={goToday}
                style={{
                  height: 30,
                  padding: '0 12px',
                  borderRadius: 7,
                  border: `1px solid ${accentHex}44`,
                  background: accentHex + '15',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  color: accentHex,
                }}
              >
                {tx('今天')}
              </button>
              <button
                onClick={view === 'month' ? nextMonth : nextWeek}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  border: '1px solid var(--border)',
                  background: 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--foreground)',
                }}
              >
                <ChevronRightIcon size={15} />
              </button>
            </div>

            {/* date label */}
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--foreground)',
                flex: 1,
                minWidth: 120,
              }}
            >
              {view === 'month' ? fmtYM(year, month, language) : weekRangeLabel}
            </div>

            {/* view switcher */}
            <div
              style={{
                display: 'flex',
                background: 'var(--muted)',
                borderRadius: 8,
                padding: 3,
                gap: 2,
              }}
            >
              {(['month', 'week'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '5px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: view === v ? 'var(--card)' : 'transparent',
                    color: view === v ? accentHex : 'var(--muted-foreground)',
                    fontWeight: view === v ? 600 : 400,
                    fontSize: 12,
                    cursor: 'pointer',
                    boxShadow: view === v ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                    transition: 'all .15s',
                  }}
                >
                  {v === 'month' ? <CalendarDaysIcon size={13} /> : <CalendarIcon size={13} />}
                  {tx(v === 'month' ? '月' : '周')}
                </button>
              ))}
            </div>
          </div>

          {/* ── views ── */}
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: view === 'month' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
              <MonthView
                year={year}
                month={month}
                todayStr={todayStr}
                onClickDate={openDayModal}
                tx={tx}
                language={language}
              />
            </div>
            <div style={{ display: view === 'week' ? 'flex' : 'none', flex: 1, minHeight: 0, flexDirection: 'column' }}>
              <WeekView
                weekDates={weekDates}
                todayStr={todayStr}
                onClickDate={openEventModal}
                tx={tx}
                language={language}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── modal ── */}
      <div style={{ display: modalDate ? 'block' : 'none' }}>
        {modalDate && (
          <DayEventModal
            dateStr={modalDate}
            events={modalEvents}
            language={language}
            tx={tx}
            onClose={closeModal}
          />
        )}
      </div>
    </AdminLayout>
  );
}
