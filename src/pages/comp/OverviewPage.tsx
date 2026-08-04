import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import {
  MousePointerClickIcon,
  FormInputIcon,
  TableIcon,
  MessageSquareWarningIcon,
  LayoutGridIcon,
  NavigationIcon,
  SmileIcon,
  HashIcon,
  TypeIcon,
  CropIcon,
  QrCodeIcon,
  PlayCircleIcon,
  GripVerticalIcon,
  MousePointer2Icon,
  DropletsIcon,
  GalleryVerticalIcon,
  PartyPopperIcon,
  FileSpreadsheetIcon,
  LayersIcon,
  SearchIcon,
  ArrowRightIcon,
  InboxIcon,
  CloudIcon,
} from 'lucide-react';

/* ─────────────────────── types ─────────────────────── */
interface CompCard {
  icon: React.ReactNode;
  name: string;
  desc: string;
  path: string;
}

interface CompGroup {
  title: string;
  colorVar: string;
  cards: CompCard[];
}

/* ─────────────────────── data ─────────────────────── */
const COMP_GROUPS: CompGroup[] = [
  {
    title: '基础组件',
    colorVar: '#6366f1',
    cards: [
      { icon: <MousePointerClickIcon size={22} />, name: '按钮组件', desc: '多语义、多尺寸、多变体按钮及状态演示', path: '/comp/buttons' },
      { icon: <SmileIcon size={22} />, name: '图标库', desc: 'Lucide 全量图标检索与分类展示', path: '/comp/icons' },
    ],
  },
  {
    title: '表单',
    colorVar: '#0ea5e9',
    cards: [
      { icon: <FormInputIcon size={22} />, name: '表单组件', desc: '输入框、选择器、开关、上传等全套表单控件', path: '/comp/forms' },
    ],
  },
  {
    title: '数据',
    colorVar: '#10b981',
    cards: [
      { icon: <TableIcon size={22} />, name: '数据表格', desc: '多条件筛选、列显隐、批量操作、智能分页', path: '/comp/table' },
      { icon: <LayoutGridIcon size={22} />, name: '数据展示', desc: '统计卡片、标签、徽章、进度条、时间线等', path: '/comp/display' },
    ],
  },
  {
    title: '反馈',
    colorVar: '#f59e0b',
    cards: [
      { icon: <MessageSquareWarningIcon size={22} />, name: '弹窗反馈', desc: 'Dialog、Drawer、Toast、Alert、Popconfirm', path: '/comp/feedback' },
      { icon: <DropletsIcon size={22} />, name: '水印', desc: 'Canvas 动态水印，多参数实时可配', path: '/comp/watermark' },
      { icon: <PartyPopperIcon size={22} />, name: '礼花', desc: '全屏粒子爆炸动画，三种触发效果', path: '/comp/confetti' },
    ],
  },
  {
    title: '导航',
    colorVar: '#8b5cf6',
    cards: [
      { icon: <NavigationIcon size={22} />, name: '导航组件', desc: 'Tabs、面包屑、分页、下拉菜单、树控件', path: '/comp/nav' },
      { icon: <MousePointer2Icon size={22} />, name: '右键菜单', desc: '自定义 ContextMenu，视口边缘自动翻转', path: '/comp/context-menu' },
    ],
  },
  {
    title: '工具',
    colorVar: '#ec4899',
    cards: [
      { icon: <TypeIcon size={22} />, name: '富文本编辑器', desc: 'contentEditable 编辑器，完整工具栏与预览', path: '/comp/rich-editor' },
      { icon: <CropIcon size={22} />, name: '图像裁剪', desc: 'Canvas 裁剪，8向拖拽调整、旋转与比例锁定', path: '/comp/image-crop' },
      { icon: <PlayCircleIcon size={22} />, name: '视频播放器', desc: '自定义控制栏、倍速、画中画、键盘快捷键', path: '/comp/video-player' },
      { icon: <QrCodeIcon size={22} />, name: '二维码', desc: '可配色、可嵌 Logo 的 Canvas 二维码生成器', path: '/comp/qrcode' },
      { icon: <GripVerticalIcon size={22} />, name: '拖拽', desc: 'Pointer Events 列表拖排与跨容器拖拽', path: '/comp/drag' },
      { icon: <GalleryVerticalIcon size={22} />, name: '文字滚动', desc: '纵向公告轮播与横向无缝跑马灯', path: '/comp/text-scroll' },
      { icon: <FileSpreadsheetIcon size={22} />, name: 'Excel 导入导出', desc: 'SheetJS 纯前端 Excel 导入解析与导出下载', path: '/comp/excel' },
      { icon: <HashIcon size={22} />, name: '数字滚动', desc: 'RAF 驱动的缓出数字滚动动画组件', path: '/comp/number-roll' },
      { icon: <CloudIcon size={22} />, name: '词云图', desc: '交互式关键词热度可视化，支持悬停查看与示例数据切换', path: '/comp/word-cloud' },
    ],
  },
];

const TOTAL = COMP_GROUPS.reduce((s, g) => s + g.cards.length, 0);

const GROUP_I18N_KEYS: Record<string, string> = {
  '基础组件': 'basic',
  '表单': 'form',
  '数据': 'data',
  '反馈': 'feedback',
  '导航': 'navigation',
  '工具': 'tools',
};

const CARD_I18N_KEYS: Record<string, { name: string; desc: string }> = {
  '/comp/buttons': { name: 'button', desc: 'buttonDesc' },
  '/comp/icons': { name: 'icons', desc: 'iconsDesc' },
  '/comp/forms': { name: 'form', desc: 'formDesc' },
  '/comp/table': { name: 'table', desc: 'tableDesc' },
  '/comp/display': { name: 'display', desc: 'displayDesc' },
  '/comp/feedback': { name: 'dialog', desc: 'dialogDesc' },
  '/comp/watermark': { name: 'watermark', desc: 'watermarkDesc' },
  '/comp/confetti': { name: 'confetti', desc: 'confettiDesc' },
  '/comp/nav': { name: 'nav', desc: 'navDesc' },
  '/comp/context-menu': { name: 'context', desc: 'contextDesc' },
  '/comp/rich-editor': { name: 'editor', desc: 'editorDesc' },
  '/comp/image-crop': { name: 'crop', desc: 'cropDesc' },
  '/comp/video-player': { name: 'video', desc: 'videoDesc' },
  '/comp/qrcode': { name: 'qrcode', desc: 'qrcodeDesc' },
  '/comp/drag': { name: 'drag', desc: 'dragDesc' },
  '/comp/text-scroll': { name: 'scroll', desc: 'scrollDesc' },
  '/comp/excel': { name: 'excel', desc: 'excelDesc' },
  '/comp/number-roll': { name: 'number', desc: 'numberDesc' },
  '/comp/word-cloud': { name: 'wordCloud', desc: 'wordCloudDesc' },
};

/* ─────────────── page-level fade transition ──────────────── */
// A thin overlay that covers the page on navigate, creating a fade-out effect.
function useFadeNavigate() {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const fadeGo = useCallback(
    (path: string) => {
      const overlay = overlayRef.current;
      if (!overlay) { navigate(path); return; }
      // fade in overlay → then navigate
      overlay.style.transition = 'none';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'all';
      // force reflow
      void overlay.offsetHeight;
      overlay.style.transition = 'opacity 0.28s ease';
      overlay.style.opacity = '1';
      const tid = setTimeout(() => navigate(path), 280);
      return () => clearTimeout(tid);
    },
    [navigate],
  );

  return { overlayRef, fadeGo };
}

/* ─────────────────── card component ─────────────────── */
interface CompCardItemProps {
  card: CompCard;
  accentColor: string;
  onNavigate: (path: string) => void;
  visible: boolean;
  animDelay: number;
}

function CompCardItem({ card, accentColor, onNavigate, visible, animDelay }: CompCardItemProps) {
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), animDelay);
    return () => clearTimeout(t);
  }, [animDelay]);

  return (
    <div
      data-cmp="CompCardItem"
      onClick={() => onNavigate(card.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '18px 16px 16px',
        borderRadius: 12,
        border: `1.5px solid ${hovered ? accentColor : 'var(--border)'}`,
        background: hovered ? `color-mix(in srgb, ${accentColor} 5%, var(--card))` : 'var(--card)',
        cursor: 'pointer',
        transition: 'border-color 0.22s, background 0.22s, box-shadow 0.22s, transform 0.22s, opacity 0.32s, translate 0.32s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 8px 24px -4px color-mix(in srgb, ${accentColor} 22%, transparent)`
          : '0 1px 4px color-mix(in srgb, var(--foreground) 6%, transparent)',
        flex: '1 1 160px',
        minWidth: 160,
        maxWidth: 240,
        userSelect: 'none',
        opacity: visible && mounted ? 1 : 0,
        translate: visible && mounted ? '0 0' : '0 10px',
      }}
    >
      {/* top-right arrow badge */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 22,
          height: 22,
          borderRadius: 6,
          background: hovered
            ? `color-mix(in srgb, ${accentColor} 15%, transparent)`
            : 'var(--muted)',
          color: hovered ? accentColor : 'var(--muted-foreground)',
          transition: 'background 0.22s, color 0.22s, transform 0.22s',
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          flexShrink: 0,
        }}
      >
        <ArrowRightIcon size={12} />
      </div>

      {/* icon circle */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          color: accentColor,
          flexShrink: 0,
          transition: 'background 0.22s',
        }}
      >
        {card.icon}
      </div>

      {/* text */}
      <div style={{ paddingRight: 8 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--foreground)',
            marginBottom: 4,
            lineHeight: 1.4,
          }}
        >
          {card.name}
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--muted-foreground)',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {card.desc}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── main page ─────────────────── */
export default function OverviewPage() {
  const { t } = useTranslation();
  const { themeState } = useTheme();
  const isManga = themeState?.themeId === 'manga';
  const primaryColor = isManga ? '#E91E8C' : 'var(--primary)';

  const [keyword, setKeyword] = useState('');
  const { overlayRef, fadeGo } = useFadeNavigate();

  const localizedGroups = COMP_GROUPS.map((group) => {
    const groupKey = GROUP_I18N_KEYS[group.title] ?? group.title;
    return {
      ...group,
      title: t(`components.overview.groups.${groupKey}.title`, { defaultValue: group.title }),
      cards: group.cards.map((card) => {
        const keys = CARD_I18N_KEYS[card.path];
        return keys ? {
          ...card,
          name: t(`components.overview.groups.${groupKey}.${keys.name}`, { defaultValue: card.name }),
          desc: t(`components.overview.groups.${groupKey}.${keys.desc}`, { defaultValue: card.desc }),
        } : card;
      }),
    };
  });

  // filter
  const q = keyword.trim().toLowerCase();
  const filteredGroups = localizedGroups.map((g) => ({
    ...g,
    cards: q
      ? g.cards.filter(
          (c) => c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q),
        )
      : g.cards,
  })).filter((g) => g.cards.length > 0);

  const totalFiltered = filteredGroups.reduce((s, g) => s + g.cards.length, 0);
  const noResult = q !== '' && totalFiltered === 0;

  // stagger index for cards
  let cardIdx = 0;

  return (
    <AdminLayout>
      {/* fade-out overlay — always in DOM, pointer-events off when transparent */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--background)',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'opacity 0.28s ease',
        }}
      />

      <div
        data-cmp="OverviewPage"
        style={{
          padding: '28px 32px 48px',
          minHeight: '100%',
          background: 'var(--background)',
        }}
      >
        {/* ── Page header ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: `color-mix(in srgb, ${primaryColor} 14%, transparent)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: primaryColor,
                flexShrink: 0,
              }}
            >
              <LayersIcon size={18} />
            </div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--foreground)',
                margin: 0,
                letterSpacing: '-0.3px',
              }}
            >
              {t('components.overview.title')}
            </h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted-foreground)', margin: 0, paddingLeft: 46 }}>
            {t('components.overview.subtitle', { count: TOTAL })}
          </p>
        </div>

        {/* ── Search bar ── */}
        <div style={{ marginBottom: 28, position: 'relative', maxWidth: 380 }}>
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted-foreground)',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SearchIcon size={15} />
          </div>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={t('components.overview.searchPlaceholder')}
            style={{
              width: '100%',
              height: 38,
              paddingLeft: 36,
              paddingRight: keyword ? 36 : 12,
              borderRadius: 9,
              border: '1.5px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = primaryColor;
              e.currentTarget.style.boxShadow = `0 0 0 3px color-mix(in srgb, ${primaryColor} 12%, transparent)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {/* clear button — always in DOM, hidden via opacity */}
          <button
            onClick={() => setKeyword('')}
            aria-hidden={!keyword}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted-foreground)',
              display: 'flex',
              alignItems: 'center',
              padding: 2,
              borderRadius: 4,
              opacity: keyword ? 1 : 0,
              pointerEvents: keyword ? 'auto' : 'none',
              transition: 'opacity 0.15s',
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Stats ribbon (hidden during search) ── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 32,
            opacity: q ? 0.4 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {localizedGroups.map((g) => (
            <div
              key={g.title}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 20,
                background: `color-mix(in srgb, ${g.colorVar} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${g.colorVar} 22%, transparent)`,
                fontSize: 13,
                color: 'var(--foreground)',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: g.colorVar,
                  flexShrink: 0,
                }}
              />
              {g.title}
              <span style={{ fontSize: 12, color: g.colorVar, fontWeight: 700, marginLeft: 1 }}>
                {g.cards.length}
              </span>
            </div>
          ))}
        </div>

        {/* ── Search result hint ── */}
        <div
          style={{
            height: q ? 32 : 0,
            overflow: 'hidden',
            transition: 'height 0.2s',
            marginBottom: q ? 12 : 0,
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--muted-foreground)', paddingBottom: 8 }}>
            {noResult ? (
              <span>{t('components.overview.noMatch', { keyword })}</span>
            ) : (
              <span>
                {t('components.overview.matchCount', { count: totalFiltered })}
              </span>
            )}
          </div>
        </div>

        {/* ── Empty state ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '64px 0',
            opacity: noResult ? 1 : 0,
            pointerEvents: noResult ? 'auto' : 'none',
            transition: 'opacity 0.22s',
            position: noResult ? 'relative' : 'absolute',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--muted-foreground)',
            }}
          >
            <InboxIcon size={28} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--foreground)', marginBottom: 4 }}>
              {t('components.overview.emptyTitle')}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted-foreground)' }}>
              {t('components.overview.emptyDesc')}
            </div>
          </div>
          <button
            onClick={() => setKeyword('')}
            style={{
              marginTop: 4,
              padding: '7px 18px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {t('components.overview.clearSearch')}
          </button>
        </div>

        {/* ── Groups ── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 36,
            opacity: noResult ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {filteredGroups.map((group) => {
            return (
              <section key={group.title} data-cmp="CompGroup">
                {/* group title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 4,
                      height: 20,
                      borderRadius: 3,
                      background: group.colorVar,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: 'var(--foreground)',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {group.title}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--muted-foreground)', marginLeft: 2 }}>
                    {t('components.overview.cardCount', { count: group.cards.length })}
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)', marginLeft: 6 }} />
                </div>

                {/* cards */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  {group.cards.map((card) => {
                    const delay = (cardIdx++ % 12) * 40;
                    return (
                      <CompCardItem
                        key={card.path}
                        card={card}
                        accentColor={group.colorVar}
                        onNavigate={fadeGo}
                        visible={true}
                        animDelay={delay}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            marginTop: 48,
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--muted-foreground)',
            fontSize: 13,
          }}
        >
          <LayersIcon size={14} />
          <span>{t('components.overview.cardHint')}</span>
        </div>
      </div>
    </AdminLayout>
  );
}
