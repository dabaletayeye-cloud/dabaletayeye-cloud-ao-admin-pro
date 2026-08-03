import { useState, useMemo } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { toast } from 'sonner';
import {
  SearchIcon,
  HomeIcon,
  UserIcon,
  SettingsIcon,
  BellIcon,
  HeartIcon,
  StarIcon,
  BookmarkIcon,
  MailIcon,
  PhoneIcon,
  CameraIcon,
  ImageIcon,
  FileIcon,
  FolderIcon,
  TrashIcon,
  EditIcon,
  SaveIcon,
  DownloadIcon,
  UploadIcon,
  ShareIcon,
  CopyIcon,
  ClipboardIcon,
  LinkIcon,
  LockIcon,
  UnlockIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
  MinusIcon,
  RefreshCwIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MenuIcon,
  GridIcon,
  ListIcon,
  LayoutIcon,
  SlidersIcon,
  FilterIcon,
  SortAscIcon,
  ZapIcon,
  ShieldIcon,
  AlertCircleIcon,
  InfoIcon,
  HelpCircleIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingUpIcon,
  BarChart2Icon,
  PieChartIcon,
  GlobeIcon,
  WifiIcon,
  BluetoothIcon,
  PrinterIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  CodeIcon,
  TerminalIcon,
  GitBranchIcon,
  PackageIcon,
  LayersIcon,
  ServerIcon,
} from 'lucide-react';

// ── Icon catalogue ────────────────────────────────────────────────────────────
interface IconEntry { name: string; label: string; node: React.ReactNode; category: string; }

const ICON_LIST: IconEntry[] = [
  // 通用
  { name:'home',          label:'首页',     node:<HomeIcon size={22}/>,          category:'通用' },
  { name:'user',          label:'用户',     node:<UserIcon size={22}/>,          category:'通用' },
  { name:'settings',      label:'设置',     node:<SettingsIcon size={22}/>,      category:'通用' },
  { name:'bell',          label:'通知',     node:<BellIcon size={22}/>,          category:'通用' },
  { name:'heart',         label:'收藏',     node:<HeartIcon size={22}/>,         category:'通用' },
  { name:'star',          label:'星标',     node:<StarIcon size={22}/>,          category:'通用' },
  { name:'bookmark',      label:'书签',     node:<BookmarkIcon size={22}/>,      category:'通用' },
  { name:'search',        label:'搜索',     node:<SearchIcon size={22}/>,        category:'通用' },
  { name:'zap',           label:'闪电',     node:<ZapIcon size={22}/>,           category:'通用' },
  { name:'shield',        label:'安全',     node:<ShieldIcon size={22}/>,        category:'通用' },
  // 通讯
  { name:'mail',          label:'邮件',     node:<MailIcon size={22}/>,          category:'通讯' },
  { name:'phone',         label:'电话',     node:<PhoneIcon size={22}/>,         category:'通讯' },
  { name:'link',          label:'链接',     node:<LinkIcon size={22}/>,          category:'通讯' },
  { name:'share',         label:'分享',     node:<ShareIcon size={22}/>,         category:'通讯' },
  { name:'globe',         label:'全球',     node:<GlobeIcon size={22}/>,         category:'通讯' },
  { name:'wifi',          label:'Wifi',     node:<WifiIcon size={22}/>,          category:'通讯' },
  { name:'bluetooth',     label:'蓝牙',     node:<BluetoothIcon size={22}/>,     category:'通讯' },
  // 文件
  { name:'file',          label:'文件',     node:<FileIcon size={22}/>,          category:'文件' },
  { name:'folder',        label:'文件夹',   node:<FolderIcon size={22}/>,        category:'文件' },
  { name:'camera',        label:'拍照',     node:<CameraIcon size={22}/>,        category:'文件' },
  { name:'image',         label:'图片',     node:<ImageIcon size={22}/>,         category:'文件' },
  { name:'clipboard',     label:'剪贴板',   node:<ClipboardIcon size={22}/>,     category:'文件' },
  { name:'copy',          label:'复制',     node:<CopyIcon size={22}/>,          category:'文件' },
  { name:'save',          label:'保存',     node:<SaveIcon size={22}/>,          category:'文件' },
  { name:'edit',          label:'编辑',     node:<EditIcon size={22}/>,          category:'文件' },
  { name:'trash',         label:'删除',     node:<TrashIcon size={22}/>,         category:'文件' },
  // 操作
  { name:'download',      label:'下载',     node:<DownloadIcon size={22}/>,      category:'操作' },
  { name:'upload',        label:'上传',     node:<UploadIcon size={22}/>,        category:'操作' },
  { name:'refresh-cw',    label:'刷新',     node:<RefreshCwIcon size={22}/>,     category:'操作' },
  { name:'check',         label:'确认',     node:<CheckIcon size={22}/>,         category:'操作' },
  { name:'x',             label:'关闭',     node:<XIcon size={22}/>,             category:'操作' },
  { name:'plus',          label:'新增',     node:<PlusIcon size={22}/>,          category:'操作' },
  { name:'minus',         label:'减少',     node:<MinusIcon size={22}/>,         category:'操作' },
  { name:'lock',          label:'锁定',     node:<LockIcon size={22}/>,          category:'操作' },
  { name:'unlock',        label:'解锁',     node:<UnlockIcon size={22}/>,        category:'操作' },
  { name:'eye',           label:'查看',     node:<EyeIcon size={22}/>,           category:'操作' },
  { name:'eye-off',       label:'隐藏',     node:<EyeOffIcon size={22}/>,        category:'操作' },
  { name:'filter',        label:'过滤',     node:<FilterIcon size={22}/>,        category:'操作' },
  { name:'sliders',       label:'调节',     node:<SlidersIcon size={22}/>,       category:'操作' },
  { name:'sort-asc',      label:'排序',     node:<SortAscIcon size={22}/>,       category:'操作' },
  // 方向
  { name:'arrow-up',      label:'向上',     node:<ArrowUpIcon size={22}/>,       category:'方向' },
  { name:'arrow-down',    label:'向下',     node:<ArrowDownIcon size={22}/>,     category:'方向' },
  { name:'arrow-left',    label:'向左',     node:<ArrowLeftIcon size={22}/>,     category:'方向' },
  { name:'arrow-right',   label:'向右',     node:<ArrowRightIcon size={22}/>,    category:'方向' },
  { name:'chevron-up',    label:'折叠上',   node:<ChevronUpIcon size={22}/>,     category:'方向' },
  { name:'chevron-down',  label:'折叠下',   node:<ChevronDownIcon size={22}/>,   category:'方向' },
  { name:'chevron-left',  label:'折叠左',   node:<ChevronLeftIcon size={22}/>,   category:'方向' },
  { name:'chevron-right', label:'折叠右',   node:<ChevronRightIcon size={22}/>,  category:'方向' },
  // 布局
  { name:'menu',          label:'菜单',     node:<MenuIcon size={22}/>,          category:'布局' },
  { name:'grid',          label:'网格',     node:<GridIcon size={22}/>,          category:'布局' },
  { name:'list',          label:'列表',     node:<ListIcon size={22}/>,          category:'布局' },
  { name:'layout',        label:'布局',     node:<LayoutIcon size={22}/>,        category:'布局' },
  { name:'layers',        label:'图层',     node:<LayersIcon size={22}/>,        category:'布局' },
  // 状态
  { name:'alert-circle',  label:'警告',     node:<AlertCircleIcon size={22}/>,   category:'状态' },
  { name:'info',          label:'信息',     node:<InfoIcon size={22}/>,          category:'状态' },
  { name:'help-circle',   label:'帮助',     node:<HelpCircleIcon size={22}/>,    category:'状态' },
  // 商务
  { name:'shopping-cart', label:'购物车',   node:<ShoppingCartIcon size={22}/>,  category:'商务' },
  { name:'credit-card',   label:'信用卡',   node:<CreditCardIcon size={22}/>,    category:'商务' },
  { name:'dollar-sign',   label:'美元',     node:<DollarSignIcon size={22}/>,    category:'商务' },
  { name:'trending-up',   label:'趋势',     node:<TrendingUpIcon size={22}/>,    category:'商务' },
  { name:'bar-chart-2',   label:'柱图',     node:<BarChart2Icon size={22}/>,     category:'商务' },
  { name:'pie-chart',     label:'饼图',     node:<PieChartIcon size={22}/>,      category:'商务' },
  { name:'tag',           label:'标签',     node:<TagIcon size={22}/>,           category:'商务' },
  // 位置/时间
  { name:'map-pin',       label:'定位',     node:<MapPinIcon size={22}/>,        category:'位置' },
  { name:'calendar',      label:'日历',     node:<CalendarIcon size={22}/>,      category:'位置' },
  { name:'clock',         label:'时钟',     node:<ClockIcon size={22}/>,         category:'位置' },
  // 设备/开发
  { name:'monitor',       label:'显示器',   node:<MonitorIcon size={22}/>,       category:'设备' },
  { name:'smartphone',    label:'手机',     node:<SmartphoneIcon size={22}/>,    category:'设备' },
  { name:'tablet',        label:'平板',     node:<TabletIcon size={22}/>,        category:'设备' },
  { name:'printer',       label:'打印机',   node:<PrinterIcon size={22}/>,       category:'设备' },
  { name:'server',        label:'服务器',   node:<ServerIcon size={22}/>,        category:'设备' },
  { name:'code',          label:'代码',     node:<CodeIcon size={22}/>,          category:'设备' },
  { name:'terminal',      label:'终端',     node:<TerminalIcon size={22}/>,      category:'设备' },
  { name:'git-branch',    label:'分支',     node:<GitBranchIcon size={22}/>,     category:'设备' },
  { name:'package',       label:'包',       node:<PackageIcon size={22}/>,       category:'设备' },
];

const ALL_CATEGORIES = ['全部', ...Array.from(new Set(ICON_LIST.map(i => i.category)))];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function IconsPage() {
  const [query,    setQuery]    = useState('');
  const [category, setCategory] = useState('全部');
  const [copied,   setCopied]   = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return ICON_LIST.filter(ic => {
      const matchCat  = category === '全部' || ic.category === category;
      const matchText = !q || ic.name.includes(q) || ic.label.includes(q);
      return matchCat && matchText;
    });
  }, [query, category]);

  const handleCopy = (ic: IconEntry) => {
    navigator.clipboard.writeText(ic.name).catch(() => {});
    setCopied(ic.name);
    toast.success(`已复制图标名称`, { description: ic.name, duration: 2000 });
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AdminLayout>
      <div data-cmp="IconsPage" style={{
        minHeight: '100%', background: 'var(--background)', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* header */}
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--foreground)' }}>图标库</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            共 {ICON_LIST.length} 个常用 Lucide 图标 · 点击图标复制名称
          </p>
        </div>

        {/* toolbar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '0 14px', height: 40, flex: '1 1 240px', maxWidth: 360,
          }}>
            <SearchIcon size={15} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜索图标名称…"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, color: 'var(--foreground)',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{
                border: 'none', background: 'none', cursor: 'pointer',
                color: 'var(--muted-foreground)', padding: 0, display: 'flex', alignItems: 'center',
              }}>
                <XIcon size={13} />
              </button>
            )}
          </div>

          {/* category pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  border: category === cat ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  background: category === cat ? 'var(--primary)' : 'var(--card)',
                  color: category === cat ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  borderRadius: 99, padding: '5px 14px', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted-foreground)', flexShrink: 0 }}>
            {filtered.length} / {ICON_LIST.length} 个
          </span>
        </div>

        {/* grid */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 10,
        }}>
          {filtered.map(ic => {
            const isCopied = copied === ic.name;
            return (
              <button
                key={ic.name}
                onClick={() => handleCopy(ic)}
                title={`点击复制: ${ic.name}`}
                style={{
                  width: 100, flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  padding: '16px 8px 12px',
                  background: isCopied ? 'var(--primary)' : 'var(--card)',
                  border: isCopied ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  borderRadius: 14,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: isCopied ? 'var(--primary-foreground)' : 'var(--foreground)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (!isCopied) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--primary)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--primary) 15%, transparent)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isCopied) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                  }
                }}
              >
                {/* icon */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: isCopied ? 'rgba(255,255,255,0.20)' : 'color-mix(in srgb, var(--primary) 10%, transparent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isCopied ? 'var(--primary-foreground)' : 'var(--primary)',
                  transition: 'all 0.15s',
                }}>
                  {ic.node}
                </div>
                {/* label */}
                <span style={{ fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                  {ic.label}
                </span>
                {/* name */}
                <span style={{
                  fontSize: 10, opacity: 0.65, textAlign: 'center',
                  wordBreak: 'break-all', lineHeight: 1.2,
                }}>
                  {ic.name}
                </span>
                {/* copied overlay tick */}
                {isCopied && (
                  <div style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CheckIcon size={11} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* empty */}
        {filtered.length === 0 && (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 12, padding: '60px 0',
            color: 'var(--muted-foreground)',
          }}>
            <SearchIcon size={40} style={{ opacity: 0.3 }} />
            <p style={{ margin: 0, fontSize: 14 }}>没有找到匹配的图标</p>
            <button onClick={() => { setQuery(''); setCategory('全部'); }} style={{
              border: '1px solid var(--border)', background: 'var(--card)', borderRadius: 8,
              padding: '6px 16px', fontSize: 13, cursor: 'pointer', color: 'var(--foreground)',
            }}>清除筛选</button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
