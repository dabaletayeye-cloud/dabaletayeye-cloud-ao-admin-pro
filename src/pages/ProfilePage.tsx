import { ChangeEvent, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../lib/localizedToast';
import {
  BarChart2Icon,
  BellIcon,
  BookOpenIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  ClockIcon,
  FileTextIcon,
  Globe2Icon,
  MailIcon,
  MapPinIcon,
  MonitorIcon,
  PhoneIcon,
  MessageSquareIcon,
  PencilIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UserRoundIcon,
  UsersIcon,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getCurrentAccount, saveCurrentAccount } from '../lib/currentAccount';

type ProfilePreferences = {
  emailNotification: boolean;
  browserNotification: boolean;
  defaultPage: string;
  workStatus: 'online' | 'focus' | 'away';
};

type ProfileTodo = {
  id: number;
  text: string;
  done: boolean;
};

const PREFERENCES_KEY = 'ao-admin-pro.profile-preferences';
const TODOS_KEY = 'ao-admin-pro.profile-todos';
const TAGS_KEY = 'ao-admin-pro.profile-tags';

type ProfileTag = {
  id: number;
  name: string;
  color: string;
};

const TAG_COLORS = ['var(--primary)', '#8B5CF6', '#16A34A', '#F97316', '#E11D48'];

const inputStyle = {
  width: '100%',
  height: 40,
  padding: '0 12px',
  borderRadius: 8,
  border: '1px solid var(--border)',
  background: 'var(--card)',
  color: 'var(--foreground)',
  outline: 'none',
  fontSize: 14,
};

const cardStyle = {
  borderColor: 'var(--border)',
  background: 'var(--card)',
  boxShadow: 'var(--shadow-x) var(--shadow-y) var(--shadow-blur) var(--shadow-spread) var(--shadow-color)',
};

function getPreferences(): ProfilePreferences {
  if (typeof window === 'undefined') {
    return { emailNotification: true, browserNotification: true, defaultPage: '/', workStatus: 'online' };
  }

  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    return stored
      ? { emailNotification: true, browserNotification: true, defaultPage: '/', workStatus: 'online', ...JSON.parse(stored) }
      : { emailNotification: true, browserNotification: true, defaultPage: '/', workStatus: 'online' };
  } catch {
    return { emailNotification: true, browserNotification: true, defaultPage: '/', workStatus: 'online' };
  }
}

function getProfileTodos(): ProfileTodo[] {
  const defaults = [
    { id: 1, text: '查看今日待处理消息', done: false },
    { id: 2, text: '完成本周运营数据复盘', done: true },
    { id: 3, text: '更新团队协作规范', done: false },
  ];

  if (typeof window === 'undefined') return defaults;

  try {
    const stored = window.localStorage.getItem(TODOS_KEY);
    return stored ? JSON.parse(stored) : defaults;
  } catch {
    return defaults;
  }
}

function getProfileTags(): ProfileTag[] {
  const defaults = [
    { id: 1, name: '团队协作', color: TAG_COLORS[0] },
    { id: 2, name: '数据驱动', color: TAG_COLORS[1] },
    { id: 3, name: '系统治理', color: TAG_COLORS[2] },
    { id: 4, name: '内容运营', color: TAG_COLORS[3] },
  ];

  if (typeof window === 'undefined') return defaults;

  try {
    const stored = window.localStorage.getItem(TAGS_KEY);
    return stored ? JSON.parse(stored) : defaults;
  } catch {
    return defaults;
  }
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={checked}
      onClick={onChange}
      className="relative h-6 w-11 shrink-0 rounded-full border-0 p-0 transition-colors"
      style={{ background: checked ? 'var(--primary)' : 'var(--border)', cursor: 'pointer' }}
    >
      <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform" style={{ left: 2, transform: checked ? 'translateX(20px)' : 'translateX(0)' }} />
    </button>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getCurrentAccount);
  const [preferences, setPreferences] = useState(getPreferences);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [todos, setTodos] = useState(getProfileTodos);
  const [todoDraft, setTodoDraft] = useState('');
  const [tags, setTags] = useState(getProfileTags);
  const [tagDraft, setTagDraft] = useState('');
  const [tagSearch, setTagSearch] = useState('');
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editingTagName, setEditingTagName] = useState('');

  const updateProfile = (key: keyof typeof profile, value: string) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updateProfile('avatar', String(reader.result));
      setAvatarFailed(false);
      toast.success('头像已更新，保存后将在全局生效');
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error('姓名和邮箱不能为空');
      return;
    }

    saveCurrentAccount(profile);
    toast.success('个人资料已保存');
  };

  const savePreferences = () => {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
    toast.success('工作偏好已保存');
  };

  const updateTodos = (nextTodos: ProfileTodo[]) => {
    setTodos(nextTodos);
    window.localStorage.setItem(TODOS_KEY, JSON.stringify(nextTodos));
  };

  const updateTags = (nextTags: ProfileTag[]) => {
    setTags(nextTags);
    window.localStorage.setItem(TAGS_KEY, JSON.stringify(nextTags));
  };

  const addTag = () => {
    const nextName = tagDraft.trim();
    if (!nextName) {
      toast.error('请输入标签名称');
      return;
    }
    if (tags.some((tag) => tag.name === nextName)) {
      toast.error('该标签已经存在');
      return;
    }
    updateTags([...tags, { id: Date.now(), name: nextName, color: TAG_COLORS[tags.length % TAG_COLORS.length] }]);
    setTagDraft('');
    toast.success('标签已添加');
  };

  const startEditTag = (tag: ProfileTag) => {
    setEditingTagId(tag.id);
    setEditingTagName(tag.name);
  };

  const saveTagEdit = (tagId: number) => {
    const nextName = editingTagName.trim();
    if (!nextName) {
      toast.error('标签名称不能为空');
      return;
    }
    if (tags.some((tag) => tag.id !== tagId && tag.name === nextName)) {
      toast.error('该标签已经存在');
      return;
    }
    updateTags(tags.map((tag) => tag.id === tagId ? { ...tag, name: nextName } : tag));
    setEditingTagId(null);
    setEditingTagName('');
    toast.success('标签已更新');
  };

  const deleteTag = (tagId: number) => {
    updateTags(tags.filter((tag) => tag.id !== tagId));
    if (editingTagId === tagId) setEditingTagId(null);
    toast.success('标签已删除');
  };

  const visibleTags = tags.filter((tag) => tag.name.toLowerCase().includes(tagSearch.trim().toLowerCase()));

  const addTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextText = todoDraft.trim();
    if (!nextText) {
      toast.error('请输入待办事项');
      return;
    }
    updateTodos([{ id: Date.now(), text: nextText, done: false }, ...todos]);
    setTodoDraft('');
  };

  const toggleTodo = (id: number) => {
    updateTodos(todos.map((todo) => todo.id === id ? { ...todo, done: !todo.done } : todo));
  };

  const removeTodo = (id: number) => {
    updateTodos(todos.filter((todo) => todo.id !== id));
  };

  const updateWorkStatus = (workStatus: ProfilePreferences['workStatus']) => {
    const nextPreferences = { ...preferences, workStatus };
    setPreferences(nextPreferences);
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(nextPreferences));
    toast.success(workStatus === 'online' ? '已切换为在线状态' : workStatus === 'focus' ? '已开启专注状态' : '已切换为离开状态');
  };

  const profileStats = [
    { label: '账号状态', value: '已验证', icon: ShieldCheckIcon, note: '邮箱已认证' },
    { label: '今日在线', value: '2 小时 26 分', icon: ClockIcon, note: '保持专注' },
    { label: '最近登录', value: '刚刚', icon: MonitorIcon, note: 'Windows 系统浏览器' },
  ];

  return (
    <AdminLayout>
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="m-0 text-2xl font-bold" style={{ color: 'var(--foreground)' }}>个人中心</h1>
            <p className="mb-0 mt-2 text-sm" style={{ color: 'var(--muted-foreground)' }}>维护个人资料，管理工作偏好与日常协作信息</p>
          </div>
          <button type="button" onClick={() => navigate('/account-security')} className="inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--card)' }}>
            <ShieldCheckIcon size={16} style={{ color: 'var(--primary)' }} />
            账号安全
            <ChevronRightIcon size={15} />
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {profileStats.map(({ label, value, icon: Icon, note }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border px-4 py-3.5" style={cardStyle}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--accent)', color: 'var(--primary)' }}><Icon size={19} /></span>
              <span className="min-w-0">
                <small className="block" style={{ color: 'var(--muted-foreground)' }}>{label}</small>
                <strong className="mt-0.5 block truncate text-sm" style={{ color: 'var(--foreground)' }}>{value}</strong>
                <em className="mt-0.5 block truncate text-xs not-italic" style={{ color: 'var(--muted-foreground)' }}>{note}</em>
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="rounded-xl border p-6" style={cardStyle}>
            <div className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4" style={{ borderColor: 'var(--accent)', background: 'var(--primary)', color: 'var(--primary-foreground)' }}>
              {!avatarFailed && profile.avatar ? (
                <img className="h-full w-full object-cover" src={profile.avatar} alt={profile.name + '的头像'} onError={() => setAvatarFailed(true)} />
              ) : (
                <span className="text-3xl font-bold">{profile.name.trim().charAt(0) || '管'}</span>
              )}
            </div>

            <div className="mt-4 text-center">
              <h2 className="m-0 text-lg font-bold" style={{ color: 'var(--foreground)' }}>{profile.name}</h2>
              <p className="mb-0 mt-1 text-sm" style={{ color: 'var(--muted-foreground)' }}>@{profile.account}</p>
              <span className="mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>{profile.role}</span>
            </div>

            <label className="mt-5 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <CameraIcon size={16} />
              更换头像
              <input className="hidden" type="file" accept="image/*" onChange={uploadAvatar} />
            </label>

            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>工作状态</span>
                <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>
                  {preferences.workStatus === 'online' ? '在线' : preferences.workStatus === 'focus' ? '专注中' : '暂时离开'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['online', '在线', 'var(--primary)'],
                  ['focus', '专注', '#F59E0B'],
                  ['away', '离开', 'var(--muted-foreground)'],
                ].map(([status, label, color]) => {
                  const isSelected = preferences.workStatus === status;
                  return (
                    <button key={status} type="button" onClick={() => updateWorkStatus(status as ProfilePreferences['workStatus'])} className="rounded-md border py-1.5 text-xs font-medium transition-colors" style={{ borderColor: isSelected ? color : 'var(--border)', background: isSelected ? 'var(--accent)' : 'transparent', color: isSelected ? color : 'var(--muted-foreground)', cursor: 'pointer' }}>
                      <i className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <div className="mb-2 flex items-center justify-between text-xs">
                <span style={{ color: 'var(--muted-foreground)' }}>资料完整度</span>
                <strong style={{ color: 'var(--primary)' }}>92%</strong>
              </div>
              <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--secondary)' }}>
                <span className="block h-full rounded-full" style={{ width: '92%', background: 'var(--primary)' }} />
              </div>
            </div>

            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>账号信息</p>
              <dl className="m-0 space-y-3 text-sm">
                {[
                  ['账号', profile.account],
                  ['部门', profile.department],
                  ['职位', profile.position],
                  ['地区', profile.location],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <dt style={{ color: 'var(--muted-foreground)' }}>{label}</dt>
                    <dd className="m-0 text-right font-medium" style={{ color: 'var(--foreground)' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>联系方式</p>
              <div className="space-y-2.5">
                <span className="flex min-w-0 items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
                  <MailIcon size={14} style={{ color: 'var(--primary)' }} />
                  <span className="truncate">{profile.email}</span>
                </span>
                <span className="flex min-w-0 items-center gap-2 text-xs" style={{ color: 'var(--foreground)' }}>
                  <PhoneIcon size={14} style={{ color: 'var(--primary)' }} />
                  <span>{profile.phone}</span>
                </span>
              </div>
            </div>

            <div className="mt-6 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>个人标签</p>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tags.length} 个</span>
              </div>
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2" size={13} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  value={tagSearch}
                  onChange={(event) => setTagSearch(event.target.value)}
                  placeholder="搜索标签"
                  aria-label="搜索个人标签"
                  style={{ ...inputStyle, height: 32, paddingLeft: 30, paddingRight: 8, fontSize: 12 }}
                />
              </div>
              <div className="mt-3 space-y-2">
                {visibleTags.length === 0 && (
                  <p className="m-0 py-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>没有匹配的标签</p>
                )}
                {visibleTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5" style={{ borderColor: 'var(--border)' }}>
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: tag.color }} />
                    {editingTagId === tag.id ? (
                      <input
                        autoFocus
                        value={editingTagName}
                        onChange={(event) => setEditingTagName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') saveTagEdit(tag.id);
                          if (event.key === 'Escape') setEditingTagId(null);
                        }}
                        className="min-w-0 flex-1 border-0 bg-transparent text-xs outline-none"
                        style={{ color: 'var(--foreground)' }}
                      />
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: 'var(--foreground)' }}>{tag.name}</span>
                    )}
                    {editingTagId === tag.id ? (
                      <button type="button" onClick={() => saveTagEdit(tag.id)} className="border-0 bg-transparent text-xs font-semibold" style={{ color: 'var(--primary)', cursor: 'pointer' }}>保存</button>
                    ) : (
                      <button type="button" onClick={() => startEditTag(tag)} title="编辑标签" className="border-0 bg-transparent p-1" style={{ color: 'var(--muted-foreground)', cursor: 'pointer' }}><PencilIcon size={13} /></button>
                    )}
                    <button type="button" onClick={() => deleteTag(tag.id)} title="删除标签" className="border-0 bg-transparent p-1" style={{ color: 'var(--muted-foreground)', cursor: 'pointer' }}><Trash2Icon size={13} /></button>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addTag(); } }}
                  placeholder="新增标签"
                  aria-label="新增标签"
                  style={{ ...inputStyle, height: 32, minWidth: 0, flex: 1, fontSize: 12 }}
                />
                <button type="button" onClick={addTag} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md border px-2 text-xs font-semibold" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: 'var(--primary-foreground)', cursor: 'pointer' }}>
                  <PlusIcon size={13} />
                  添加
                </button>
              </div>
              <p className="mb-0 mt-3 text-xs leading-5" style={{ color: 'var(--muted-foreground)' }}>加入平台：2024-01-15 · 当前时区：GMT+8</p>
            </div>
          </aside>

          <div className="space-y-5">
            <form onSubmit={saveProfile} className="rounded-xl border p-6" style={cardStyle}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>基本资料</h2>
                  <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>保存后会同步到右上角账户菜单</p>
                </div>
                <UserRoundIcon size={20} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  姓名
                  <input value={profile.name} onChange={(event) => updateProfile('name', event.target.value)} style={inputStyle} />
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  账号
                  <input value={profile.account} disabled style={{ ...inputStyle, cursor: 'not-allowed', opacity: 0.68, background: 'var(--secondary)' }} />
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  邮箱
                  <span className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--muted-foreground)' }} />
                    <input type="email" value={profile.email} onChange={(event) => updateProfile('email', event.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  手机号
                  <input value={profile.phone} onChange={(event) => updateProfile('phone', event.target.value)} style={inputStyle} />
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  部门
                  <input value={profile.department} onChange={(event) => updateProfile('department', event.target.value)} style={inputStyle} />
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  职位
                  <input value={profile.position} onChange={(event) => updateProfile('position', event.target.value)} style={inputStyle} />
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  所在地区
                  <span className="relative">
                    <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'var(--muted-foreground)' }} />
                    <input value={profile.location} onChange={(event) => updateProfile('location', event.target.value)} style={{ ...inputStyle, paddingLeft: 36 }} />
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  个人简介
                  <textarea value={profile.bio} onChange={(event) => updateProfile('bio', event.target.value)} className="min-h-10 resize-y rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2" style={{ borderColor: 'var(--border)', background: 'var(--card)', color: 'var(--foreground)' }} />
                </label>
              </div>

              <div className="mt-5 flex justify-end">
                <button className="inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-opacity hover:opacity-90" type="submit" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  <SaveIcon size={16} />
                  保存资料
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <section className="rounded-xl border p-6" style={cardStyle}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>工作偏好</h2>
                    <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>设置日常工作提醒与默认入口</p>
                  </div>
                  <SettingsIcon size={20} style={{ color: 'var(--primary)' }} />
                </div>

                <label className="grid gap-2 text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  默认进入页面
                  <select value={preferences.defaultPage} onChange={(event) => setPreferences((current) => ({ ...current, defaultPage: event.target.value }))} style={inputStyle}>
                    <option value="/">工作台</option>
                    <option value="/dashboard/analytics">分析看板</option>
                    <option value="/content/articles">内容管理</option>
                    <option value="/messages">消息中心</option>
                  </select>
                </label>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                    <span>
                      <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>邮箱提醒</strong>
                      <small style={{ color: 'var(--muted-foreground)' }}>接收任务与系统通知</small>
                    </span>
                    <Toggle checked={preferences.emailNotification} label="切换邮箱提醒" onChange={() => setPreferences((current) => ({ ...current, emailNotification: !current.emailNotification }))} />
                  </div>
                  <div className="flex items-center justify-between gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                    <span>
                      <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>浏览器提醒</strong>
                      <small style={{ color: 'var(--muted-foreground)' }}>新消息到达时提示</small>
                    </span>
                    <Toggle checked={preferences.browserNotification} label="切换浏览器提醒" onChange={() => setPreferences((current) => ({ ...current, browserNotification: !current.browserNotification }))} />
                  </div>
                </div>

                <button type="button" onClick={savePreferences} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'transparent' }}>
                  <SaveIcon size={15} />
                  保存偏好
                </button>
              </section>

              <section className="rounded-xl border p-6" style={cardStyle}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>角色与权限</h2>
                    <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>当前账号的业务访问范围</p>
                  </div>
                  <UsersIcon size={20} style={{ color: 'var(--primary)' }} />
                </div>

                <div className="flex items-center gap-3 rounded-lg border p-3" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'var(--accent)', color: 'var(--primary)' }}><ShieldCheckIcon size={18} /></span>
                  <span>
                    <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>{profile.role}</strong>
                    <small style={{ color: 'var(--muted-foreground)' }}>{profile.department}</small>
                  </span>
                </div>

                <p className="mb-2 mt-4 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>已授权模块</p>
                <div className="flex flex-wrap gap-2">
                  {['工作台', '系统管理', '数据分析', '内容管理', '消息中心'].map((permission) => (
                    <span key={permission} className="rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>{permission}</span>
                  ))}
                </div>

                <button type="button" onClick={() => navigate('/account-security')} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-semibold hover:bg-accent" style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'transparent' }}>
                  <ShieldCheckIcon size={15} />
                  管理账号安全
                </button>
              </section>
            </div>

            <section className="rounded-xl border p-6" style={cardStyle}>
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>最近活动</h2>
                  <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>账号在系统中的最近操作记录</p>
                </div>
                <FileTextIcon size={20} style={{ color: 'var(--primary)' }} />
              </div>

              <div className="space-y-0">
                {[
                  ['更新了个人资料', '刚刚', UserRoundIcon],
                  ['查看账号安全设置', '今天 10:25', ShieldCheckIcon],
                  ['发布文章《团队协作规范》', '昨天 16:40', FileTextIcon],
                  ['调整工作台主题偏好', '昨天 09:15', Globe2Icon],
                  ['阅读系统通知', '2026-08-03 18:20', BellIcon],
                ].map(([title, time, Icon], index, entries) => (
                  <div key={title as string} className="flex gap-3 pb-4 last:pb-0">
                    <span className="relative flex w-7 shrink-0 justify-center">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>
                        {(() => { const ActivityIcon = Icon as typeof UserRoundIcon; return <ActivityIcon size={14} />; })()}
                      </span>
                      {index < entries.length - 1 && <i className="absolute bottom-0 top-7 w-px" style={{ background: 'var(--border)' }} />}
                    </span>
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-3 pt-1">
                      <strong className="truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>{title as string}</strong>
                      <small className="shrink-0 text-xs" style={{ color: 'var(--muted-foreground)' }}>{time as string}</small>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <section className="rounded-xl border p-6" style={cardStyle}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>本周工作概览</h2>
                    <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>近 7 天的个人活跃情况</p>
                  </div>
                  <BarChart2Icon size={20} style={{ color: 'var(--primary)' }} />
                </div>

                <div className="flex h-32 items-end justify-between gap-2 border-b px-1 pb-2" style={{ borderColor: 'var(--border)' }}>
                  {[
                    ['一', 46],
                    ['二', 72],
                    ['三', 54],
                    ['四', 88],
                    ['五', 65],
                    ['六', 30],
                    ['日', 42],
                  ].map(([day, height]) => (
                    <div key={day as string} className="flex flex-1 flex-col items-center gap-2">
                      <span className="block w-full max-w-7 rounded-t-md" style={{ height: String(height) + '%', minHeight: 10, background: 'var(--primary)', opacity: day === '四' ? 1 : 0.58 }} />
                      <small style={{ color: 'var(--muted-foreground)' }}>{day as string}</small>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  {[
                    ['完成事项', '18'],
                    ['专注时长', '12.5h'],
                    ['活跃天数', '6'],
                  ].map(([label, value]) => (
                    <span key={label}>
                      <strong className="block text-base" style={{ color: 'var(--foreground)' }}>{value}</strong>
                      <small style={{ color: 'var(--muted-foreground)' }}>{label}</small>
                    </span>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border p-6" style={cardStyle}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>个人成就</h2>
                    <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>持续积累你的工作影响力</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-lg" style={{ background: 'var(--accent)' }}>🏆</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['连续活跃', '14 天', '🔥'],
                    ['内容贡献', '36 篇', '✦'],
                    ['协作达人', '12 次', '◎'],
                  ].map(([label, value, symbol]) => (
                    <div key={label} className="rounded-lg border p-3 text-center" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                      <span className="text-lg">{symbol}</span>
                      <strong className="mt-1 block text-sm" style={{ color: 'var(--foreground)' }}>{value}</strong>
                      <small className="mt-1 block text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</small>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border)', background: 'var(--secondary)' }}>
                  <span>
                    <strong className="block text-sm" style={{ color: 'var(--foreground)' }}>下一个成就</strong>
                    <small style={{ color: 'var(--muted-foreground)' }}>再完成 4 个待办即可解锁</small>
                  </span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>8 / 12</span>
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-xl border p-6" style={cardStyle}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>我的待办</h2>
                    <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>{todos.filter((todo) => todo.done).length} / {todos.length} 已完成</p>
                  </div>
                  <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: 'var(--accent)', color: 'var(--primary)' }}>本周</span>
                </div>

                <form className="mb-4 flex gap-2" onSubmit={addTodo}>
                  <input value={todoDraft} onChange={(event) => setTodoDraft(event.target.value)} placeholder="添加一条待办事项" style={inputStyle} />
                  <button type="submit" className="h-10 shrink-0 rounded-lg border px-3 text-sm font-semibold" style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>添加</button>
                </form>

                <div className="space-y-2">
                  {todos.map((todo) => (
                    <div key={todo.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5" style={{ borderColor: 'var(--border)', background: todo.done ? 'var(--secondary)' : 'var(--card)' }}>
                      <button type="button" aria-label={todo.done ? '标记为未完成' : '标记为已完成'} onClick={() => toggleTodo(todo.id)} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border" style={{ borderColor: todo.done ? 'var(--primary)' : 'var(--border)', color: 'var(--primary-foreground)', background: todo.done ? 'var(--primary)' : 'transparent', cursor: 'pointer' }}>
                        {todo.done && <CheckIcon size={13} strokeWidth={3} />}
                      </button>
                      <span className="min-w-0 flex-1 truncate text-sm" style={{ color: todo.done ? 'var(--muted-foreground)' : 'var(--foreground)', textDecoration: todo.done ? 'line-through' : 'none' }}>{todo.text}</span>
                      <button type="button" onClick={() => removeTodo(todo.id)} className="border-0 bg-transparent text-xs" style={{ color: 'var(--muted-foreground)', cursor: 'pointer' }}>移除</button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border p-6" style={cardStyle}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="m-0 text-base font-bold" style={{ color: 'var(--foreground)' }}>常用入口</h2>
                    <p className="mb-0 mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>快速返回常用业务模块</p>
                  </div>
                  <BookOpenIcon size={20} style={{ color: 'var(--primary)' }} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['工作台', '/', BarChart2Icon],
                    ['内容管理', '/content/articles', FileTextIcon],
                    ['消息中心', '/messages', MessageSquareIcon],
                    ['系统设置', '/settings', SettingsIcon],
                  ].map(([label, path, Icon]) => {
                    const QuickIcon = Icon as typeof BarChart2Icon;
                    return (
                      <button key={label as string} type="button" onClick={() => navigate(path as string)} className="flex min-h-20 flex-col items-start justify-between rounded-lg border p-3 text-left transition-colors hover:bg-accent" style={{ borderColor: 'var(--border)', background: 'var(--secondary)', cursor: 'pointer' }}>
                        <QuickIcon size={18} style={{ color: 'var(--primary)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label as string}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
