import { useRef, useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  BellIcon,
  MegaphoneIcon,
  AlertCircleIcon,
  InfoIcon,
  CheckCircleIcon,
  StarIcon,
  ZapIcon,
  GiftIcon,
  RadioIcon,
  GaugeIcon,
} from 'lucide-react';

// ════════════════════════════════════════════════════════════════
//  一、垂直公告滚动
// ════════════════════════════════════════════════════════════════

interface Notice {
  id: number;
  icon: React.ReactNode;
  iconColor: string;
  title: string;
  time: string;
  tag: string;
  tagColor: string;
}

const NOTICES: Notice[] = [
  { id: 1, icon: <BellIcon size={15} />,        iconColor: 'var(--theme-primary)', title: '系统将于今晚 23:00 进行例行维护，预计持续 2 小时',       time: '2025-06-10 09:00', tag: '系统', tagColor: '#6366f1' },
  { id: 2, icon: <MegaphoneIcon size={15} />,   iconColor: '#f59e0b',              title: '618 大促活动已正式启动，优惠券发放通道已开放',            time: '2025-06-09 14:30', tag: '活动', tagColor: '#f59e0b' },
  { id: 3, icon: <AlertCircleIcon size={15} />, iconColor: '#ef4444',              title: '检测到异常登录行为，请及时检查账户安全设置',               time: '2025-06-09 11:15', tag: '安全', tagColor: '#ef4444' },
  { id: 4, icon: <CheckCircleIcon size={15} />, iconColor: '#10b981',              title: 'v3.8.0 版本已成功部署，新增批量导出与智能推荐功能',        time: '2025-06-08 18:00', tag: '更新', tagColor: '#10b981' },
  { id: 5, icon: <InfoIcon size={15} />,        iconColor: '#3b82f6',              title: '数据报表模块新增「自定义时间维度」分析能力',               time: '2025-06-08 10:00', tag: '功能', tagColor: '#3b82f6' },
  { id: 6, icon: <ZapIcon size={15} />,         iconColor: '#a855f7',              title: '接口响应速度整体提升 40%，缓存策略已全面优化',             time: '2025-06-07 16:45', tag: '性能', tagColor: '#a855f7' },
  { id: 7, icon: <StarIcon size={15} />,        iconColor: '#f97316',              title: '用户满意度调研已开启，填写问卷即可获得积分奖励',           time: '2025-06-07 09:30', tag: '调研', tagColor: '#f97316' },
  { id: 8, icon: <GiftIcon size={15} />,        iconColor: '#ec4899',              title: '端午节专属福利包已发放，请前往个人中心领取',               time: '2025-06-06 08:00', tag: '福利', tagColor: '#ec4899' },
];

const ITEM_HEIGHT = 56;

function NoticeScrollCard() {
  const [paused, setPaused] = useState(false);
  const [offset, setOffset] = useState(0);
  const rafRef    = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const totalHeight = NOTICES.length * ITEM_HEIGHT;
  const doubled     = [...NOTICES, ...NOTICES];

  const step = useCallback((ts: number) => {
    if (lastTsRef.current === null) lastTsRef.current = ts;
    const delta = ts - lastTsRef.current;
    lastTsRef.current = ts;
    offsetRef.current += (delta / 1000) * 40;
    if (offsetRef.current >= totalHeight) offsetRef.current -= totalHeight;
    setOffset(offsetRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, [totalHeight]);

  useEffect(() => {
    if (!paused) {
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(step);
    } else {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [paused, step]);

  return (
    <div data-cmp="NoticeScrollCard" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,12px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.08))' }}>
      {/* 标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--theme-primary)', display: 'inline-block', boxShadow: '0 0 0 3px color-mix(in srgb,var(--theme-primary) 20%,transparent)' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>系统公告</span>
          <span style={{ fontSize: 11, background: 'color-mix(in srgb,var(--theme-primary) 12%,transparent)', color: 'var(--theme-primary)', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>{NOTICES.length} 条</span>
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{paused ? '已暂停' : '滚动中…'}</span>
      </div>

      {/* 滚动区 */}
      <div style={{ height: ITEM_HEIGHT * 5, overflow: 'hidden', position: 'relative' }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(to bottom,var(--card),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 32, background: 'linear-gradient(to top,var(--card),transparent)', zIndex: 2, pointerEvents: 'none' }} />
        <div style={{ transform: `translateY(-${offset}px)`, willChange: 'transform' }}>
          {doubled.map((n, i) => <NoticeItem key={`${n.id}-${i}`} notice={n} />)}
        </div>
      </div>
    </div>
  );
}

function NoticeItem({ notice }: { notice: Notice }) {
  return (
    <div
      style={{ height: ITEM_HEIGHT, display: 'flex', alignItems: 'center', gap: 14, padding: '0 24px', borderBottom: '1px solid var(--border)', cursor: 'default', transition: 'background 0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'color-mix(in srgb,var(--muted) 60%,transparent)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <span style={{ flexShrink: 0, width: 30, height: 30, borderRadius: 8, background: `color-mix(in srgb,${notice.iconColor} 14%,transparent)`, color: notice.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notice.icon}</span>
      <span style={{ flex: 1, fontSize: 13, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notice.title}</span>
      <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: notice.tagColor, background: `color-mix(in srgb,${notice.tagColor} 12%,transparent)`, borderRadius: 4, padding: '2px 7px' }}>{notice.tag}</span>
      <span style={{ flexShrink: 0, fontSize: 12, color: 'var(--muted-foreground)', minWidth: 112, textAlign: 'right' }}>{notice.time}</span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  二、横向跑马灯
// ════════════════════════════════════════════════════════════════

// 跑马灯滚动文本列表（用分隔符连接）
const TICKER_MESSAGES = [
  '🔔  系统将于本周六凌晨 2:00–4:00 进行升级维护，期间部分功能暂停服务，请提前做好数据备份',
  '🎉  618 年中大促倒计时 3 天！全场商品最高优惠 50%，会员专属折扣同步开启',
  '⚡  v3.9.0 版本正式发布：新增 AI 智能分析模块、暗色主题优化、性能提升 35%',
  '🛡  安全公告：建议所有用户开启两步验证，防范账户被盗风险',
  '📦  批量导出功能已上线，支持 Excel / CSV / JSON 三种格式，可前往报表中心体验',
];

// 速度档位
const SPEED_OPTIONS: { label: string; value: number }[] = [
  { label: '慢', value: 60 },
  { label: '中', value: 120 },
  { label: '快', value: 220 },
];

// 分隔符
const SEPARATOR = '　　　✦　　　';

function MarqueeCard() {
  const [speed, setSpeed]   = useState(120);           // px/s
  const [paused, setPaused] = useState(false);

  // 把所有消息拼成一长串（双倍以便无缝）
  const fullText = TICKER_MESSAGES.join(SEPARATOR) + SEPARATOR;

  const trackRef  = useRef<HTMLDivElement>(null);
  const rafRef    = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const [offset, setOffset] = useState(0);

  // 单份文字宽度（渲染后测量）
  const singleWidthRef = useRef(0);

  // 测量单份宽度
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    // 第一个子元素是"第一份"文字
    const first = el.children[0] as HTMLSpanElement | undefined;
    if (first) singleWidthRef.current = first.offsetWidth;
  });

  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const step = useCallback((ts: number) => {
    if (lastTsRef.current === null) lastTsRef.current = ts;
    const delta = ts - lastTsRef.current;
    lastTsRef.current = ts;

    offsetRef.current += (delta / 1000) * speedRef.current;

    const sw = singleWidthRef.current;
    if (sw > 0 && offsetRef.current >= sw) {
      offsetRef.current -= sw;
    }

    setOffset(offsetRef.current);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (!paused) {
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(step);
    } else {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [paused, step]);

  const activeSpeed = SPEED_OPTIONS.find(o => o.value === speed) ?? SPEED_OPTIONS[1];

  return (
    <div data-cmp="MarqueeCard" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,12px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.08))' }}>

      {/* 卡片标题栏 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', display: 'inline-block', boxShadow: '0 0 0 3px color-mix(in srgb,#f59e0b 22%,transparent)' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--foreground)' }}>横向跑马灯</span>
          <span style={{ fontSize: 11, background: 'color-mix(in srgb,#f59e0b 14%,transparent)', color: '#b45309', borderRadius: 20, padding: '1px 8px', fontWeight: 600 }}>Marquee</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RadioIcon size={13} style={{ color: paused ? 'var(--muted-foreground)' : '#f59e0b' }} />
          <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>{paused ? '已暂停' : `${activeSpeed.label}速滚动中…`}</span>
        </div>
      </div>

      {/* 色带跑马灯主体 */}
      <div
        style={{ position: 'relative', overflow: 'hidden', cursor: 'default' }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* 色带背景 */}
        <div style={{
          background: 'linear-gradient(90deg,#f59e0b 0%,#fbbf24 50%,#f59e0b 100%)',
          padding: '0',
          position: 'relative',
          overflow: 'hidden',
          height: 52,
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* 左侧渐变遮罩 */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right,#f59e0b,transparent)', zIndex: 2, pointerEvents: 'none' }} />
          {/* 右侧渐变遮罩 */}
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left,#f59e0b,transparent)', zIndex: 2, pointerEvents: 'none' }} />

          {/* 滚动文字轨道 */}
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              transform: `translateX(-${offset}px)`,
              willChange: 'transform',
            }}
          >
            {/* 两份文字实现无缝循环 */}
            <span style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12', letterSpacing: '0.02em', paddingRight: 0 }}>
              {fullText}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#7c2d12', letterSpacing: '0.02em', paddingRight: 0 }}>
              {fullText}
            </span>
          </div>
        </div>

        {/* 悬浮提示 */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          background: 'rgba(0,0,0,0.55)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 20,
          padding: '4px 14px',
          pointerEvents: 'none',
          opacity: paused ? 1 : 0,
          transition: 'opacity 0.2s',
          whiteSpace: 'nowrap',
          zIndex: 10,
        }}>
          已暂停 — 移开鼠标继续
        </div>
      </div>

      {/* 速度控制面板 */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <GaugeIcon size={15} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ fontSize: 13, color: 'var(--muted-foreground)', fontWeight: 500 }}>滚动速度</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {SPEED_OPTIONS.map(opt => {
            const active = speed === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setSpeed(opt.value)}
                style={{
                  padding: '5px 18px',
                  borderRadius: 20,
                  border: active ? '1.5px solid #f59e0b' : '1.5px solid var(--border)',
                  background: active ? 'color-mix(in srgb,#f59e0b 14%,transparent)' : 'transparent',
                  color: active ? '#b45309' : 'var(--muted-foreground)',
                  fontWeight: active ? 700 : 500,
                  fontSize: 13,
                  cursor: 'pointer',
                  transition: 'all 0.18s',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 'auto' }}>
          当前 {speed} px/s
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  实现原理卡片（汇总两种效果）
// ════════════════════════════════════════════════════════════════

function UsageCard() {
  const tips = [
    { label: '无缝循环', desc: '两种效果均将内容克隆一份首尾拼接，位移到达单份长度时瞬间归零，视觉无跳帧' },
    { label: '悬浮暂停', desc: '鼠标进入时取消 RAF，离开后从当前偏移量继续驱动；横向版额外显示"已暂停"提示层' },
    { label: '速度切换', desc: '横向跑马灯通过 ref 同步速度值，切换档位后下一帧立刻生效，无需重启动画循环' },
    { label: 'RAF 驱动', desc: 'requestAnimationFrame + delta 时间步长精确控速，与设备帧率无关，丝滑不卡顿' },
    { label: '渐变遮罩', desc: '左右 / 上下两端使用 CSS linear-gradient 遮罩，内容淡入淡出，避免生硬截断' },
  ];

  return (
    <div data-cmp="UsageCard" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px', boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,12px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.08))' }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--foreground)', marginBottom: 16 }}>实现原理</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tips.map(tip => (
          <div key={tip.label} style={{ display: 'flex', gap: 12 }}>
            <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: 'var(--theme-primary)', background: 'color-mix(in srgb,var(--theme-primary) 12%,transparent)', borderRadius: 4, padding: '3px 8px', height: 'fit-content', marginTop: 1 }}>{tip.label}</span>
            <span style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.65 }}>{tip.desc}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  页面入口
// ════════════════════════════════════════════════════════════════

function SectionTitle({ index, title, sub }: { index: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--theme-primary)', color: 'var(--primary-foreground)', fontSize: 12, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{index}</span>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--foreground)' }}>{title}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: 'var(--muted-foreground)', paddingLeft: 34 }}>{sub}</p>
    </div>
  );
}

export default function TextScrollPage() {
  return (
    <AdminLayout>
      <div data-cmp="TextScrollPage" style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>

        {/* 页面大标题 */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ width: 4, height: 20, borderRadius: 2, background: 'var(--theme-primary)', display: 'inline-block' }} />
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--foreground)', margin: 0 }}>文字滚动</h1>
          </div>
          <p style={{ fontSize: 13, color: 'var(--muted-foreground)', margin: 0, paddingLeft: 14 }}>
            两种常见的文字滚动形态演示：垂直公告无缝循环 &amp; 横向跑马灯，均支持鼠标悬浮暂停
          </p>
        </div>

        {/* §1 垂直公告滚动 */}
        <SectionTitle index="1" title="垂直公告滚动" sub="多条公告向上无缝循环，滚到底部自动接回开头，鼠标悬浮暂停" />
        <NoticeScrollCard />

        {/* §2 横向跑马灯 */}
        <div style={{ marginTop: 36 }}>
          <SectionTitle index="2" title="横向跑马灯" sub="通栏色带，文字从右向左无缝循环，可切换慢 / 中 / 快三档速度，鼠标悬浮暂停" />
          <MarqueeCard />
        </div>

        {/* 实现原理 */}
        <div style={{ marginTop: 28 }}>
          <UsageCard />
        </div>

      </div>
    </AdminLayout>
  );
}
