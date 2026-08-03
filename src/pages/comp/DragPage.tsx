import React, { useState, useRef, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  GripVerticalIcon,
  StarIcon,
  ZapIcon,
  HeartIcon,
  RocketIcon,
  LeafIcon,
  FlameIcon,
  CheckCircle2Icon,
  ClockIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  CodeIcon,
  PaletteIcon,
} from 'lucide-react';

// ─────────────────────────────────────────────
// Shared types
// ─────────────────────────────────────────────
interface DragCard {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  accentVar: string;
}

// ─────────────────────────────────────────────
// Section 1 — List Sort data
// ─────────────────────────────────────────────
const INITIAL_LIST_CARDS: DragCard[] = [
  {
    id: 1,
    title: '性能优化方案',
    subtitle: '首屏渲染速度深度优化，含代码分割与懒加载策略',
    tag: '技术',
    tagColor: 'var(--theme-primary)',
    icon: <ZapIcon size={16} />,
    accentVar: '--chart-1',
  },
  {
    id: 2,
    title: '用户体验调研',
    subtitle: '收集用户反馈并整理成可执行的设计改进清单',
    tag: '设计',
    tagColor: 'var(--chart-2)',
    icon: <HeartIcon size={16} />,
    accentVar: '--chart-2',
  },
  {
    id: 3,
    title: '新功能规划',
    subtitle: '2025 Q2 产品路线图，含 AI 助手集成与移动端适配',
    tag: '产品',
    tagColor: 'var(--chart-3)',
    icon: <RocketIcon size={16} />,
    accentVar: '--chart-3',
  },
  {
    id: 4,
    title: '绿色部署计划',
    subtitle: '减少服务器碳排放，采用弹性扩缩容与节能调度策略',
    tag: '运维',
    tagColor: 'var(--chart-4)',
    icon: <LeafIcon size={16} />,
    accentVar: '--chart-4',
  },
  {
    id: 5,
    title: '热点活动追踪',
    subtitle: '实时监控平台热度事件，自动生成运营推送内容',
    tag: '运营',
    tagColor: 'var(--chart-5)',
    icon: <FlameIcon size={16} />,
    accentVar: '--chart-5',
  },
  {
    id: 6,
    title: '月度质量评审',
    subtitle: '代码质量、测试覆盖率与线上稳定性综合评分报告',
    tag: '质量',
    tagColor: 'var(--theme-accent)',
    icon: <StarIcon size={16} />,
    accentVar: '--theme-accent',
  },
];

// ─────────────────────────────────────────────
// Section 2 — Cross-container data
// ─────────────────────────────────────────────
interface KanbanCard {
  id: number;
  title: string;
  desc: string;
  tag: string;
  tagColor: string;
  icon: React.ReactNode;
  accentVar: string;
  priority: 'high' | 'mid' | 'low';
}

const PRIORITY_COLOR: Record<string, string> = {
  high: 'var(--chart-1)',
  mid: 'var(--chart-3)',
  low: 'var(--chart-4)',
};
const PRIORITY_LABEL: Record<string, string> = {
  high: '高优',
  mid: '中优',
  low: '低优',
};

const INITIAL_TODO: KanbanCard[] = [
  {
    id: 101,
    title: '重构登录模块',
    desc: '使用 OAuth2.0 替换旧有账密体系，支持第三方登录',
    tag: '技术',
    tagColor: 'var(--chart-1)',
    icon: <CodeIcon size={15} />,
    accentVar: '--chart-1',
    priority: 'high',
  },
  {
    id: 102,
    title: '设计系统升级',
    desc: '统一 Design Token，输出 Figma 与组件库双向同步方案',
    tag: '设计',
    tagColor: 'var(--chart-2)',
    icon: <PaletteIcon size={15} />,
    accentVar: '--chart-2',
    priority: 'mid',
  },
  {
    id: 103,
    title: '季度业务复盘',
    desc: '梳理 Q1 核心指标达成情况，输出改进计划',
    tag: '运营',
    tagColor: 'var(--chart-5)',
    icon: <BriefcaseIcon size={15} />,
    accentVar: '--chart-5',
    priority: 'low',
  },
];

const INITIAL_DONE: KanbanCard[] = [
  {
    id: 201,
    title: '埋点体系搭建',
    desc: '全链路行为数据采集，打通前后端分析闭环',
    tag: '技术',
    tagColor: 'var(--chart-1)',
    icon: <ZapIcon size={15} />,
    accentVar: '--chart-1',
    priority: 'high',
  },
  {
    id: 202,
    title: '移动端适配',
    desc: '完成核心页面响应式改造，覆盖 375px–1440px 断点',
    tag: '设计',
    tagColor: 'var(--chart-2)',
    icon: <RocketIcon size={15} />,
    accentVar: '--chart-2',
    priority: 'mid',
  },
  {
    id: 203,
    title: '用户增长活动',
    desc: '双十一拉新裂变活动圆满收官，新增 DAU 3.2 万',
    tag: '运营',
    tagColor: 'var(--chart-5)',
    icon: <FlameIcon size={15} />,
    accentVar: '--chart-5',
    priority: 'low',
  },
];

// ─────────────────────────────────────────────
// Section 1 Component — List Sort
// ─────────────────────────────────────────────
function ListSortDemo() {
  const [cards, setCards] = useState<DragCard[]>(INITIAL_LIST_CARDS);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const dragIndexRef = useRef<number>(-1);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRectsRef = useRef<DOMRect[]>([]);
  const isDraggingRef = useRef(false);

  const getItemRects = useCallback(() => {
    if (!listRef.current) return [];
    const items = Array.from(listRef.current.querySelectorAll<HTMLElement>('[data-list-item]'));
    return items.map((el) => el.getBoundingClientRect());
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, index: number) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragIndexRef.current = index;
      isDraggingRef.current = false;
      itemRectsRef.current = getItemRects();
      setDraggingId(cards[index].id);
      setOverIndex(index);
    },
    [cards, getItemRects],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (dragIndexRef.current === -1) return;
    isDraggingRef.current = true;
    const clientY = e.clientY;
    const rects = itemRectsRef.current;
    let newOver = dragIndexRef.current;
    for (let i = 0; i < rects.length; i++) {
      const mid = rects[i].top + rects[i].height / 2;
      if (clientY < mid) { newOver = i; break; }
      newOver = i;
    }
    setOverIndex(newOver);
  }, []);

  const handlePointerUp = useCallback(() => {
    if (dragIndexRef.current === -1) return;
    const from = dragIndexRef.current;
    const to = overIndex ?? from;
    if (isDraggingRef.current && from !== to) {
      setCards((prev) => {
        const next = [...prev];
        const [removed] = next.splice(from, 1);
        next.splice(to, 0, removed);
        return next;
      });
    }
    dragIndexRef.current = -1;
    isDraggingRef.current = false;
    setDraggingId(null);
    setOverIndex(null);
  }, [overIndex]);

  return (
    <div className="flex gap-6 items-start">
      {/* List */}
      <div className="flex-1" style={{ maxWidth: 580 }}>
        <div
          className="rounded-2xl border p-5"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>任务列表</span>
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
            >
              {cards.length} 项
            </span>
          </div>

          <div
            ref={listRef}
            className="flex flex-col"
            onPointerMove={draggingId !== null ? handlePointerMove : undefined}
            onPointerUp={draggingId !== null ? handlePointerUp : undefined}
            onPointerLeave={draggingId !== null ? handlePointerUp : undefined}
          >
            {cards.map((card, index) => {
              const isDragging = card.id === draggingId;
              const isOver = overIndex === index && draggingId !== null && !isDragging;
              const fromIndex = dragIndexRef.current;
              const showAbove = isOver && fromIndex > index;
              const showBelow = isOver && fromIndex < index;

              return (
                <div key={card.id} data-list-item style={{ marginBottom: 8 }}>
                  {/* Placeholder above */}
                  <div
                    style={{
                      height: showAbove ? 64 : 0,
                      overflow: 'hidden',
                      transition: 'height 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
                      borderRadius: 12,
                      border: showAbove ? '2px dashed var(--theme-primary)' : '2px dashed transparent',
                      background: showAbove ? 'color-mix(in srgb, var(--theme-primary) 6%, transparent)' : 'transparent',
                      marginBottom: showAbove ? 8 : 0,
                    }}
                  />

                  {/* Card */}
                  <div
                    style={{
                      background: isDragging ? 'color-mix(in srgb, var(--card) 70%, transparent)' : 'var(--card)',
                      border: isDragging ? '1.5px solid var(--theme-primary)' : '1.5px solid var(--border)',
                      borderRadius: 12,
                      opacity: isDragging ? 0.5 : 1,
                      boxShadow: isDragging
                        ? '0 8px 28px color-mix(in srgb, var(--theme-primary) 18%, transparent)'
                        : '0 1px 3px color-mix(in srgb, var(--foreground) 5%, transparent)',
                      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
                      transition: isDragging
                        ? 'box-shadow 0.15s, transform 0.15s'
                        : 'opacity 0.2s, box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 14px',
                      gap: 12,
                      userSelect: 'none',
                      cursor: isDragging ? 'grabbing' : 'default',
                    }}
                  >
                    {/* Handle */}
                    <div
                      onPointerDown={(e) => handlePointerDown(e, index)}
                      style={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        borderRadius: 7,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isDragging ? 'var(--theme-primary)' : 'var(--muted-foreground)',
                        background: isDragging
                          ? 'color-mix(in srgb, var(--theme-primary) 12%, transparent)'
                          : 'var(--muted)',
                        cursor: isDragging ? 'grabbing' : 'grab',
                        transition: 'background 0.15s, color 0.15s',
                        touchAction: 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isDragging) {
                          (e.currentTarget as HTMLElement).style.background =
                            'color-mix(in srgb, var(--theme-primary) 12%, transparent)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--theme-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isDragging) {
                          (e.currentTarget as HTMLElement).style.background = 'var(--muted)';
                          (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
                        }
                      }}
                    >
                      <GripVerticalIcon size={13} />
                    </div>

                    {/* Icon */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `color-mix(in srgb, var(${card.accentVar}) 14%, transparent)`,
                        color: `var(${card.accentVar})`,
                      }}
                    >
                      {card.icon}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
                        {card.title}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {card.subtitle}
                      </div>
                    </div>

                    {/* Tag */}
                    <div
                      style={{
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 20,
                        background: `color-mix(in srgb, ${card.tagColor} 12%, transparent)`,
                        color: card.tagColor,
                        border: `1px solid color-mix(in srgb, ${card.tagColor} 22%, transparent)`,
                      }}
                    >
                      {card.tag}
                    </div>

                    {/* Index */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        background: 'var(--muted)',
                        color: 'var(--muted-foreground)',
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Placeholder below */}
                  <div
                    style={{
                      height: showBelow ? 64 : 0,
                      overflow: 'hidden',
                      transition: 'height 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
                      borderRadius: 12,
                      border: showBelow ? '2px dashed var(--theme-primary)' : '2px dashed transparent',
                      background: showBelow ? 'color-mix(in srgb, var(--theme-primary) 6%, transparent)' : 'transparent',
                      marginTop: showBelow ? 8 : 0,
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div
            className="mt-2 pt-4 flex items-center gap-2 text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          >
            <GripVerticalIcon size={11} />
            <span>拖动左侧手柄调整顺序，序号自动更新</span>
          </div>
        </div>
      </div>

      {/* Right mini panel */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div
          className="rounded-2xl border p-4"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="text-xs font-semibold mb-3" style={{ color: 'var(--foreground)' }}>当前顺序</div>
          <div className="flex flex-col gap-1.5">
            {cards.map((card, i) => (
              <div key={card.id} className="flex items-center gap-2">
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--theme-primary)', width: 14, textAlign: 'right', flexShrink: 0 }}>{i + 1}</span>
                <div
                  style={{
                    flex: 1, height: 24, borderRadius: 7, display: 'flex', alignItems: 'center',
                    paddingLeft: 7, gap: 5, background: 'var(--muted)',
                    fontSize: 11, color: 'var(--foreground)', fontWeight: 500, overflow: 'hidden',
                  }}
                >
                  <span style={{ color: `var(${card.accentVar})`, flexShrink: 0 }}>{card.icon}</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section 2 Component — Cross-container
// ─────────────────────────────────────────────

type PanelId = 'todo' | 'done';

function CrossContainerDemo() {
  const [todoCards, setTodoCards] = useState<KanbanCard[]>(INITIAL_TODO);
  const [doneCards, setDoneCards] = useState<KanbanCard[]>(INITIAL_DONE);

  // drag state
  const [draggingCardId, setDraggingCardId] = useState<number | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<PanelId | null>(null);
  // which panel pointer is currently over
  const [hoverPanel, setHoverPanel] = useState<PanelId | null>(null);
  // over-index within the hover panel (for intra-panel reorder placeholder)
  const [overIndexInPanel, setOverIndexInPanel] = useState<number | null>(null);

  const isDraggingRef = useRef(false);
  const startedRef = useRef(false);

  // refs to each panel DOM node for hit-testing
  const todoPanelRef = useRef<HTMLDivElement>(null);
  const donePanelRef = useRef<HTMLDivElement>(null);

  // per-panel item rects snapshot
  const todoRectsRef = useRef<DOMRect[]>([]);
  const doneRectsRef = useRef<DOMRect[]>([]);

  const snapshotRects = useCallback(() => {
    const snap = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current) return [];
      return Array.from(ref.current.querySelectorAll<HTMLElement>('[data-kanban-item]'))
        .map((el) => el.getBoundingClientRect());
    };
    todoRectsRef.current = snap(todoPanelRef);
    doneRectsRef.current = snap(donePanelRef);
  }, []);

  const hitTestPanel = useCallback((clientX: number): PanelId | null => {
    const test = (ref: React.RefObject<HTMLDivElement | null>): boolean => {
      if (!ref.current) return false;
      const r = ref.current.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right;
    };
    if (test(todoPanelRef)) return 'todo';
    if (test(donePanelRef)) return 'done';
    return null;
  }, []);

  const calcOverIndex = useCallback((clientY: number, rects: DOMRect[]): number => {
    if (rects.length === 0) return 0;
    let idx = rects.length - 1;
    for (let i = 0; i < rects.length; i++) {
      if (clientY < rects[i].top + rects[i].height / 2) { idx = i; break; }
    }
    return idx;
  }, []);

  const handleCardPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, cardId: number, from: PanelId) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      startedRef.current = true;
      isDraggingRef.current = false;
      setDraggingCardId(cardId);
      setDraggingFrom(from);
      setHoverPanel(from);
      snapshotRects();
      // initial over-index
      const cards = from === 'todo' ? todoCards : doneCards;
      const idx = cards.findIndex((c) => c.id === cardId);
      setOverIndexInPanel(idx);
    },
    [todoCards, doneCards, snapshotRects],
  );

  const handleGlobalPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!startedRef.current) return;
      isDraggingRef.current = true;
      const panel = hitTestPanel(e.clientX);
      setHoverPanel(panel);
      if (panel === 'todo') {
        setOverIndexInPanel(calcOverIndex(e.clientY, todoRectsRef.current));
      } else if (panel === 'done') {
        setOverIndexInPanel(calcOverIndex(e.clientY, doneRectsRef.current));
      } else {
        setOverIndexInPanel(null);
      }
    },
    [hitTestPanel, calcOverIndex],
  );

  const handleGlobalPointerUp = useCallback(() => {
    if (!startedRef.current) return;
    startedRef.current = false;

    if (isDraggingRef.current && draggingCardId !== null && draggingFrom !== null) {
      const destPanel = hoverPanel;

      if (destPanel && destPanel !== draggingFrom) {
        // Cross-container: move card
        const insertAt = overIndexInPanel ?? (destPanel === 'todo' ? todoCards.length : doneCards.length);

        if (draggingFrom === 'todo') {
          const card = todoCards.find((c) => c.id === draggingCardId);
          if (card) {
            setTodoCards((prev) => prev.filter((c) => c.id !== draggingCardId));
            setDoneCards((prev) => {
              const next = [...prev];
              next.splice(Math.min(insertAt, next.length), 0, card);
              return next;
            });
          }
        } else {
          const card = doneCards.find((c) => c.id === draggingCardId);
          if (card) {
            setDoneCards((prev) => prev.filter((c) => c.id !== draggingCardId));
            setTodoCards((prev) => {
              const next = [...prev];
              next.splice(Math.min(insertAt, next.length), 0, card);
              return next;
            });
          }
        }
      } else if (destPanel && destPanel === draggingFrom) {
        // Intra-panel reorder
        const insertAt = overIndexInPanel;
        if (insertAt !== null) {
          const setter = draggingFrom === 'todo' ? setTodoCards : setDoneCards;
          const list = draggingFrom === 'todo' ? todoCards : doneCards;
          const fromIdx = list.findIndex((c) => c.id === draggingCardId);
          if (fromIdx !== -1 && fromIdx !== insertAt) {
            setter((prev) => {
              const next = [...prev];
              const [removed] = next.splice(fromIdx, 1);
              next.splice(insertAt > fromIdx ? insertAt - 1 : insertAt, 0, removed);
              return next;
            });
          }
        }
      }
    }

    isDraggingRef.current = false;
    setDraggingCardId(null);
    setDraggingFrom(null);
    setHoverPanel(null);
    setOverIndexInPanel(null);
  }, [draggingCardId, draggingFrom, hoverPanel, overIndexInPanel, todoCards, doneCards]);

  const renderKanbanCard = (
    card: KanbanCard,
    panelId: PanelId,
    index: number,
  ) => {
    const isDragging = card.id === draggingCardId;
    const isDone = panelId === 'done';

    return (
      <div key={card.id} data-kanban-item style={{ marginBottom: 8 }}>
        <div
          style={{
            background: isDragging
              ? 'color-mix(in srgb, var(--card) 65%, transparent)'
              : isDone
                ? 'color-mix(in srgb, var(--muted) 60%, var(--card))'
                : 'var(--card)',
            border: isDragging
              ? `1.5px solid var(--theme-primary)`
              : `1.5px solid var(--border)`,
            borderRadius: 12,
            padding: '12px 14px',
            opacity: isDragging ? 0.45 : 1,
            transform: isDragging ? 'scale(1.02) rotate(1deg)' : 'scale(1) rotate(0deg)',
            transition: isDragging
              ? 'box-shadow 0.15s, transform 0.15s'
              : 'opacity 0.2s, transform 0.25s, border-color 0.2s',
            boxShadow: isDragging
              ? '0 10px 32px color-mix(in srgb, var(--theme-primary) 20%, transparent)'
              : '0 1px 3px color-mix(in srgb, var(--foreground) 4%, transparent)',
            userSelect: 'none',
            cursor: isDragging ? 'grabbing' : 'default',
            position: 'relative',
          }}
        >
          {/* Done overlay stripe */}
          {isDone && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                bottom: 0,
                borderRadius: '12px 0 0 12px',
                background: 'var(--chart-4)',
                opacity: 0.7,
              }}
            />
          )}

          <div className="flex items-start gap-3" style={{ paddingLeft: isDone ? 8 : 0 }}>
            {/* Handle */}
            <div
              onPointerDown={(e) => handleCardPointerDown(e, card.id, panelId)}
              style={{
                flexShrink: 0,
                marginTop: 2,
                width: 24,
                height: 24,
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDragging ? 'var(--theme-primary)' : 'var(--muted-foreground)',
                background: isDragging
                  ? 'color-mix(in srgb, var(--theme-primary) 12%, transparent)'
                  : 'var(--muted)',
                cursor: isDragging ? 'grabbing' : 'grab',
                transition: 'background 0.15s, color 0.15s',
                touchAction: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isDragging) {
                  (e.currentTarget as HTMLElement).style.background =
                    'color-mix(in srgb, var(--theme-primary) 12%, transparent)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--theme-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDragging) {
                  (e.currentTarget as HTMLElement).style.background = 'var(--muted)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
                }
              }}
            >
              <GripVerticalIcon size={12} />
            </div>

            {/* Icon */}
            <div
              style={{
                flexShrink: 0,
                width: 32,
                height: 32,
                borderRadius: 9,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `color-mix(in srgb, var(${card.accentVar}) 14%, transparent)`,
                color: isDone ? 'var(--muted-foreground)' : `var(${card.accentVar})`,
                filter: isDone ? 'grayscale(0.5)' : 'none',
                transition: 'color 0.2s, filter 0.2s',
              }}
            >
              {card.icon}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDone ? 'var(--muted-foreground)' : 'var(--foreground)',
                  marginBottom: 3,
                  textDecoration: isDone ? 'line-through' : 'none',
                  textDecorationColor: 'var(--muted-foreground)',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--muted-foreground)',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {card.desc}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '1px 7px',
                    borderRadius: 20,
                    background: `color-mix(in srgb, ${card.tagColor} 10%, transparent)`,
                    color: isDone ? 'var(--muted-foreground)' : card.tagColor,
                    border: `1px solid color-mix(in srgb, ${card.tagColor} 20%, transparent)`,
                  }}
                >
                  {card.tag}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    padding: '1px 7px',
                    borderRadius: 20,
                    background: `color-mix(in srgb, ${PRIORITY_COLOR[card.priority]} 10%, transparent)`,
                    color: isDone ? 'var(--muted-foreground)' : PRIORITY_COLOR[card.priority],
                  }}
                >
                  {PRIORITY_LABEL[card.priority]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPanel = (
    panelId: PanelId,
    title: string,
    cards: KanbanCard[],
    panelRef: React.RefObject<HTMLDivElement | null>,
    accentColor: string,
    Icon: React.ReactNode,
  ) => {
    const isHighlighted = hoverPanel === panelId && draggingCardId !== null && draggingFrom !== panelId;
    const isDragSource = draggingFrom === panelId && draggingCardId !== null;

    return (
      <div style={{ flex: 1 }}>
        <div
          ref={panelRef}
          style={{
            borderRadius: 18,
            border: isHighlighted
              ? `2px solid ${accentColor}`
              : isDragSource
                ? `2px solid var(--border)`
                : `2px solid var(--border)`,
            background: isHighlighted
              ? `color-mix(in srgb, ${accentColor} 5%, var(--card))`
              : 'var(--card)',
            transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
            boxShadow: isHighlighted
              ? `0 0 0 4px color-mix(in srgb, ${accentColor} 12%, transparent)`
              : 'none',
            overflow: 'hidden',
          }}
        >
          {/* Panel Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
                  color: accentColor,
                }}
              >
                {Icon}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                {title}
              </span>
            </div>
            {/* Badge */}
            <div
              style={{
                minWidth: 24,
                height: 24,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                fontSize: 12,
                fontWeight: 700,
                background: isHighlighted
                  ? accentColor
                  : `color-mix(in srgb, ${accentColor} 15%, transparent)`,
                color: isHighlighted ? 'var(--primary-foreground)' : accentColor,
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {cards.length}
            </div>
          </div>

          {/* Cards area */}
          <div style={{ padding: '14px 14px 6px 14px', minHeight: 120 }}>
            {cards.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-8 gap-2"
                style={{ color: 'var(--muted-foreground)', fontSize: 12 }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    border: `2px dashed color-mix(in srgb, ${accentColor} 30%, var(--border))`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `color-mix(in srgb, ${accentColor} 50%, var(--muted-foreground))`,
                    marginBottom: 4,
                  }}
                >
                  <ArrowRightIcon size={16} />
                </div>
                <span>将卡片拖入此区域</span>
              </div>
            ) : (
              cards.map((card, index) => renderKanbanCard(card, panelId, index))
            )}

            {/* Drop placeholder at bottom when hovering from opposite panel */}
            {isHighlighted && cards.length > 0 && (
              <div
                style={{
                  height: 56,
                  borderRadius: 12,
                  border: `2px dashed ${accentColor}`,
                  background: `color-mix(in srgb, ${accentColor} 6%, transparent)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: accentColor,
                  fontWeight: 500,
                  gap: 6,
                  marginBottom: 8,
                  transition: 'opacity 0.2s',
                }}
              >
                <ArrowRightIcon size={13} />
                松手放入此面板
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex gap-5"
      onPointerMove={draggingCardId !== null ? handleGlobalPointerMove : undefined}
      onPointerUp={draggingCardId !== null ? handleGlobalPointerUp : undefined}
      onPointerLeave={draggingCardId !== null ? handleGlobalPointerUp : undefined}
      style={{ touchAction: 'none' }}
    >
      {renderPanel(
        'todo',
        '待办',
        todoCards,
        todoPanelRef,
        'var(--chart-1)',
        <ClockIcon size={15} />,
      )}

      {/* Center arrow */}
      <div className="flex flex-col items-center justify-center" style={{ width: 40, flexShrink: 0, gap: 8 }}>
        <div style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>
          <ArrowRightIcon size={16} />
        </div>
        <div style={{ color: 'var(--muted-foreground)', opacity: 0.5, transform: 'rotate(180deg)' }}>
          <ArrowRightIcon size={16} />
        </div>
      </div>

      {renderPanel(
        'done',
        '完成',
        doneCards,
        donePanelRef,
        'var(--chart-4)',
        <CheckCircle2Icon size={15} />,
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────
export default function DragPage() {
  return (
    <AdminLayout>
      <div data-cmp="DragPage" className="p-6 min-h-full" style={{ background: 'var(--background)' }}>

        {/* ── Page Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--theme-primary)', color: 'var(--primary-foreground)' }}
            >
              <GripVerticalIcon size={18} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>拖拽</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--muted-foreground)' }}>
            常见拖拽交互的实现演示，基于 Pointer Events API，零依赖
          </p>
        </div>

        {/* ── Section 1: List Sort ── */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 2,
                background: 'var(--theme-primary)',
                flexShrink: 0,
              }}
            />
            <div>
              <div className="text-base font-bold" style={{ color: 'var(--foreground)' }}>列表拖拽排序</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                按住卡片左侧手柄上下拖动，蓝色虚线框标示目标落点，松手平滑换位
              </div>
            </div>
          </div>
          <ListSortDemo />
        </section>

        {/* ── Section 2: Cross-container ── */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div
              style={{
                width: 4,
                height: 18,
                borderRadius: 2,
                background: 'var(--chart-4)',
                flexShrink: 0,
              }}
            />
            <div>
              <div className="text-base font-bold" style={{ color: 'var(--foreground)' }}>容器间拖拽</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                在"待办"与"完成"面板间拖拽卡片，拖入时目标面板高亮边框，面板顶部数量徽标实时更新
              </div>
            </div>
          </div>
          <CrossContainerDemo />
        </section>
      </div>
    </AdminLayout>
  );
}
