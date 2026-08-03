import { useMemo, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { BarChart3Icon, CloudIcon, MousePointerClickIcon, RefreshCwIcon, TrendingUpIcon } from 'lucide-react';

type WordItem = {
  text: string;
  value: number;
  x: number;
  y: number;
  rotate?: number;
  color: string;
};

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6'];

const OPERATION_WORDS: WordItem[] = [
  { text: 'AI 智能', value: 100, x: 380, y: 218, color: COLORS[0] },
  { text: '数据分析', value: 82, x: 374, y: 132, color: COLORS[2] },
  { text: '用户增长', value: 78, x: 390, y: 303, color: COLORS[1] },
  { text: '智慧运营', value: 69, x: 237, y: 226, color: COLORS[6], rotate: -18 },
  { text: '内容创作', value: 66, x: 535, y: 220, color: COLORS[5], rotate: 16 },
  { text: '精细化', value: 64, x: 284, y: 167, color: COLORS[3], rotate: -10 },
  { text: '数字化', value: 61, x: 487, y: 156, color: COLORS[7], rotate: 12 },
  { text: '私域流量', value: 60, x: 489, y: 286, color: COLORS[4], rotate: -13 },
  { text: '商业增长', value: 58, x: 264, y: 289, color: COLORS[2], rotate: 15 },
  { text: '用户体验', value: 56, x: 180, y: 154, color: COLORS[1] },
  { text: '智能客服', value: 54, x: 604, y: 157, color: COLORS[0], rotate: -16 },
  { text: '数据驱动', value: 53, x: 163, y: 262, color: COLORS[5], rotate: 12 },
  { text: '运营策略', value: 51, x: 588, y: 280, color: COLORS[3] },
  { text: '品牌营销', value: 49, x: 367, y: 371, color: COLORS[6] },
  { text: '自动化', value: 48, x: 376, y: 69, color: COLORS[4] },
  { text: '转化率', value: 46, x: 100, y: 207, color: COLORS[7], rotate: -15 },
  { text: '产品创新', value: 45, x: 658, y: 223, color: COLORS[2], rotate: 14 },
  { text: '用户画像', value: 44, x: 610, y: 350, color: COLORS[1], rotate: -12 },
  { text: '增长黑客', value: 43, x: 123, y: 336, color: COLORS[3] },
  { text: '全域触达', value: 41, x: 574, y: 84, color: COLORS[5] },
  { text: '实时洞察', value: 40, x: 181, y: 83, color: COLORS[6], rotate: 16 },
  { text: '协同办公', value: 38, x: 75, y: 130, color: COLORS[4] },
  { text: '客户成功', value: 37, x: 704, y: 310, color: COLORS[7], rotate: -16 },
  { text: '降本增效', value: 36, x: 684, y: 108, color: COLORS[0], rotate: 14 },
  { text: '社群运营', value: 35, x: 75, y: 279, color: COLORS[2], rotate: -12 },
  { text: '敏捷迭代', value: 34, x: 295, y: 409, color: COLORS[5] },
  { text: '营销自动化', value: 33, x: 490, y: 399, color: COLORS[3], rotate: -10 },
  { text: '价值共创', value: 32, x: 92, y: 391, color: COLORS[1], rotate: 12 },
];

const PRODUCT_NAMES = ['产品体验', '用户需求', '创新设计', '功能迭代', '交互设计', '产品价值', '用户反馈', '体验升级', '需求洞察', '敏捷开发', '服务设计', '用户旅程', '产品规划', '价值交付', '设计系统', '增长实验', '业务场景', '性能优化', '数据埋点', '客户价值', '可用性', '产品思维', '智能推荐', '持续交付', '市场验证', '全链路', '产品战略', '用户共创'];

const DATASETS = [
  { label: '运营热点', caption: '近 30 天运营讨论热词', words: OPERATION_WORDS },
  { label: '产品热点', caption: '近 30 天产品讨论热词', words: OPERATION_WORDS.map((word, index) => ({ ...word, text: PRODUCT_NAMES[index] })) },
];

function getFontSize(value: number) {
  return 13 + ((value - 32) / 68) * 31;
}

export default function WordCloudPage() {
  const [datasetIndex, setDatasetIndex] = useState(0);
  const [selectedWord, setSelectedWord] = useState<WordItem>(OPERATION_WORDS[0]);
  const [hoveredWord, setHoveredWord] = useState<WordItem | null>(null);
  const dataset = DATASETS[datasetIndex];
  const topWords = useMemo(() => [...dataset.words].sort((a, b) => b.value - a.value).slice(0, 6), [dataset]);

  const changeDataset = () => {
    const nextIndex = (datasetIndex + 1) % DATASETS.length;
    setDatasetIndex(nextIndex);
    setSelectedWord(DATASETS[nextIndex].words[0]);
    setHoveredWord(null);
  };

  return (
    <AdminLayout>
      <style>{`
        @keyframes word-cloud-enter { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes word-cloud-word-enter { from { opacity: 0; } to { opacity: 1; } }
        .word-cloud-page { animation: word-cloud-enter .36s ease both; }
        .word-cloud-layout { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 20px; align-items: stretch; }
        .word-cloud-canvas { min-height: 470px; }
        .word-cloud-svg { display: block; width: 100%; height: 100%; min-height: 430px; overflow: visible; }
        .word-cloud-word { transition: opacity .18s ease, filter .18s ease; animation: word-cloud-word-enter .35s ease both; }
        .word-cloud-word:hover { opacity: .82; filter: drop-shadow(0 4px 7px color-mix(in srgb, var(--word-color) 40%, transparent)); }
        .word-cloud-word.is-selected { filter: drop-shadow(0 5px 8px color-mix(in srgb, var(--word-color) 46%, transparent)); }
        @media (max-width: 980px) { .word-cloud-layout { grid-template-columns: 1fr; } .word-cloud-canvas { min-height: 420px; } }
        @media (max-width: 600px) { .word-cloud-canvas { min-height: 300px; } .word-cloud-svg { min-height: 290px; } }
      `}</style>

      <div className="word-cloud-page" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 7px 16px rgba(99,102,241,.25)' }}><CloudIcon size={19} /></span>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, lineHeight: 1.3, fontWeight: 700, color: 'var(--foreground)' }}>词云图</h1>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>将关键词热度映射为文字大小，快速识别关注焦点</p>
            </div>
          </div>
          <button type="button" onClick={changeDataset} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 13px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,.04)' }}>
            <RefreshCwIcon size={14} /> 切换示例数据
          </button>
        </div>

        <div className="word-cloud-layout">
          <section style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,.035)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3Icon size={17} style={{ color: 'var(--primary)' }} /><span style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)' }}>{dataset.label}</span></div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted-foreground)' }}>{dataset.caption}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 9px', borderRadius: 999, background: 'color-mix(in srgb, var(--primary) 10%, transparent)', color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}><TrendingUpIcon size={13} />{dataset.words.length} 个关键词</div>
            </div>

            <div className="word-cloud-canvas" style={{ position: 'relative', padding: '12px 14px 8px', background: 'radial-gradient(circle at 50% 46%, color-mix(in srgb, var(--primary) 7%, transparent), transparent 52%)' }}>
              <svg className="word-cloud-svg" viewBox="0 0 760 430" role="img" aria-label={`${dataset.label}词云图`} preserveAspectRatio="xMidYMid meet">
                {dataset.words.map((word, index) => (
                  <text
                    key={`${datasetIndex}-${word.text}`}
                    className={`word-cloud-word${selectedWord.text === word.text ? ' is-selected' : ''}`}
                    x={word.x}
                    y={word.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={word.rotate ? `rotate(${word.rotate} ${word.x} ${word.y})` : undefined}
                    fill={word.color}
                    fontSize={getFontSize(word.value)}
                    fontWeight={word.value >= 78 ? 800 : word.value >= 55 ? 700 : 600}
                    role="button"
                    tabIndex={0}
                    aria-label={`${word.text}，热度 ${word.value}`}
                    style={{ '--word-color': word.color, cursor: 'pointer', animationDelay: `${index * 18}ms` } as React.CSSProperties}
                    onMouseEnter={() => setHoveredWord(word)}
                    onMouseLeave={() => setHoveredWord(null)}
                    onClick={() => setSelectedWord(word)}
                    onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') setSelectedWord(word); }}
                  >{word.text}</text>
                ))}
              </svg>
              <div style={{ position: 'absolute', right: 18, bottom: 15, padding: '7px 10px', maxWidth: 220, borderRadius: 8, background: 'color-mix(in srgb, var(--card) 92%, transparent)', border: '1px solid var(--border)', boxShadow: '0 4px 14px rgba(0,0,0,.08)', pointerEvents: 'none', fontSize: 11, color: 'var(--muted-foreground)' }}>
                <span style={{ display: 'inline-flex', verticalAlign: 'middle', marginRight: 5 }}><MousePointerClickIcon size={12} /></span>{hoveredWord ? `“${hoveredWord.text}” 热度 ${hoveredWord.value}` : '悬停查看热度，点击关键词查看详情'}
              </div>
            </div>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ padding: 18, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,.035)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 15 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: selectedWord.color, boxShadow: `0 0 0 4px color-mix(in srgb, ${selectedWord.color} 14%, transparent)` }} /><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>当前关键词</span></div>
              <div style={{ fontSize: 27, fontWeight: 800, letterSpacing: '-.5px', color: selectedWord.color, marginBottom: 8 }}>{selectedWord.text}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}><span style={{ fontSize: 24, fontWeight: 800, color: 'var(--foreground)' }}>{selectedWord.value}</span><span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>热度指数</span></div>
              <div style={{ height: 7, marginTop: 13, overflow: 'hidden', borderRadius: 999, background: 'var(--muted)' }}><div style={{ width: `${selectedWord.value}%`, height: '100%', borderRadius: 'inherit', background: selectedWord.color, transition: 'width .25s ease' }} /></div>
            </section>

            <section style={{ flex: 1, padding: 18, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, boxShadow: '0 2px 10px rgba(0,0,0,.035)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }}><span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>热度排行</span><span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>TOP 6</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {topWords.map((word, index) => (
                  <button key={word.text} type="button" onClick={() => setSelectedWord(word)} style={{ display: 'grid', gridTemplateColumns: '21px minmax(0, 1fr) 33px', alignItems: 'center', gap: 8, width: '100%', padding: '5px 6px', margin: '0 -6px', border: 0, borderRadius: 7, cursor: 'pointer', textAlign: 'left', background: selectedWord.text === word.text ? 'color-mix(in srgb, var(--primary) 9%, transparent)' : 'transparent', color: 'inherit' }}>
                    <span style={{ width: 20, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, fontSize: 11, fontWeight: 800, color: index < 3 ? '#fff' : 'var(--muted-foreground)', background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#c08457' : 'var(--muted)' }}>{index + 1}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, color: 'var(--foreground)', fontWeight: 600 }}>{word.text}</span>
                    <span style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: word.color }}>{word.value}</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}
