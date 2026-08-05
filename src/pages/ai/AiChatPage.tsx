import { useEffect, useMemo, useRef, useState } from 'react';
import {
  BotIcon, CheckIcon, ChevronLeftIcon, ChevronRightIcon, CircleStopIcon, Code2Icon, CopyIcon, Edit3Icon,
  FileUpIcon, Globe2Icon, HeartIcon, ImageIcon, MenuIcon, MessageCirclePlusIcon, MoreHorizontalIcon,
  PaperclipIcon, SearchIcon, SendIcon, ThumbsDownIcon, ThumbsUpIcon, Trash2Icon, UploadIcon, Volume2Icon,
  WifiIcon, XIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { LowcodeButton } from '../lowcode/LowcodeShared';
import { AiPageShell, AiSwitch } from './AiShared';

type Role = 'user' | 'assistant';
type Message = { id: string; role: Role; content: string; time: string; model?: string; code?: string; cot?: string; liked?: 'up' | 'down' };
type Conversation = { id: string; title: string; model: string; group: '今天' | '昨天' | '更早'; time: string; pinned?: boolean; messages: Message[] };
type ContextMenuState = { id: string; x: number; y: number } | null;

const initialConversations: Conversation[] = [
  { id: 'c1', title: '如何设计一套 RBAC 权限模型', model: 'GPT-4o', group: '今天', time: '10:28', messages: [{ id: 'm1', role: 'user', content: '如何设计一套 RBAC 权限模型？', time: '10:26' }, { id: 'm2', role: 'assistant', model: 'GPT-4o', time: '10:27', content: 'RBAC（基于角色的访问控制）可以用「用户 → 角色 → 权限 → 资源」四层模型来设计。\n\n首先把权限粒度拆分为菜单、页面和按钮/数据权限；再用角色聚合权限，将用户与多个角色关联。这样既便于权限复用，也能满足一个用户拥有多个角色的场景。', cot: '识别到问题属于权限体系设计，先建立最小可用的实体模型，再补充前端与数据权限的粒度建议。' }] },
  { id: 'c2', title: '订单创建接口的异常处理', model: 'DeepSeek', group: '今天', time: '09:42', messages: [{ id: 'm3', role: 'user', content: '订单创建接口如何设计异常处理？', time: '09:40' }, { id: 'm4', role: 'assistant', model: 'DeepSeek', time: '09:41', content: '建议区分参数校验、库存不足、支付失败、幂等冲突和第三方超时五类异常，并通过统一错误码返回。' }] },
  { id: 'c3', title: 'Vue3 组合式函数封装', model: 'Claude 3.5', group: '昨天', time: '昨天 17:30', messages: [{ id: 'm5', role: 'user', content: '写一个 Vue3 分页组合式函数', time: '昨天 17:25' }, { id: 'm6', role: 'assistant', model: 'Claude 3.5', time: '昨天 17:26', content: '下面是一个可复用的分页组合式函数，支持请求状态与刷新。', code: "import { ref } from 'vue';\n\nexport function usePagination(fetcher) {\n  const page = ref(1);\n  const pageSize = ref(20);\n  const list = ref([]);\n  const loading = ref(false);\n  const load = async () => {\n    loading.value = true;\n    try { list.value = await fetcher({ page: page.value, pageSize: pageSize.value }); }\n    finally { loading.value = false; }\n  };\n  return { page, pageSize, list, loading, load };\n}" }] },
  { id: 'c4', title: '客服机器人欢迎语优化', model: 'Kimi', group: '更早', time: '08-01', messages: [{ id: 'm7', role: 'user', content: '优化一下客服欢迎语', time: '08-01' }, { id: 'm8', role: 'assistant', model: 'Kimi', time: '08-01', content: '您好，我是小智客服，很高兴为您服务。您可以直接描述遇到的问题，我会尽力协助您解决。' }] },
];
const modelNames = ['GPT-4o', 'Claude 3.5', 'DeepSeek', 'Kimi', '自定义模型'];
const quickQuestions = ['写一段 Vue3 代码', '解释什么是 RBAC', '帮我优化一段 SQL', '制定接口错误码规范'];

function readableTime() { return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }); }

export default function AiChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState('c1');
  const [query, setQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [editingTitle, setEditingTitle] = useState(false);
  const [params, setParams] = useState({ temperature: 0.7, tokens: 32, topP: 0.9, frequency: 0, presence: 0, system: '你是 ao-admin-pro 的智能助手，请以清晰、专业、简洁的方式回答问题。', online: true, deep: false, code: true, image: false });
  const [knowledge, setKnowledge] = useState<string[]>(['产品帮助中心']);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const streamRef = useRef<number | null>(null);
  const active = conversations.find(item => item.id === activeId) ?? conversations[0];
  const filtered = useMemo(() => conversations.filter(item => item.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))), [conversations, query]);
  const byGroup = (group: Conversation['group']) => filtered.filter(item => item.group === group);
  const updateConversation = (id: string, patch: Partial<Conversation>) => setConversations(previous => previous.map(item => item.id === id ? { ...item, ...patch } : item));
  const stopGenerating = () => { if (streamRef.current) window.clearInterval(streamRef.current); streamRef.current = null; setIsGenerating(false); toast.message('已停止生成'); };
  useEffect(() => () => { if (streamRef.current) window.clearInterval(streamRef.current); }, []);
  useEffect(() => { const close = () => setContextMenu(null); window.addEventListener('click', close); return () => window.removeEventListener('click', close); }, []);

  const newConversation = () => {
    const id = `c-${Date.now()}`; const next: Conversation = { id, title: '新对话', model: 'GPT-4o', group: '今天', time: '刚刚', messages: [] };
    setConversations(previous => [next, ...previous]); setActiveId(id); setMessageInput(''); toast.success('已新建对话');
  };
  const getResponse = (question: string) => {
    if (/vue|代码|code/i.test(question)) return { text: '当然可以。下面给出一个简洁的 Vue 3 组合式函数示例，它将异步请求、加载状态和错误状态统一封装，页面中可以直接复用。', code: "import { ref } from 'vue';\n\nexport function useRequest(request) {\n  const loading = ref(false);\n  const data = ref(null);\n  const error = ref(null);\n  const run = async (...args) => {\n    loading.value = true;\n    error.value = null;\n    try { data.value = await request(...args); }\n    catch (err) { error.value = err; }\n    finally { loading.value = false; }\n  };\n  return { loading, data, error, run };\n}", cot: '识别到用户希望获取可运行代码，因此选择 Composition API，并提供通用请求状态封装。' };
    return { text: `我会从需求目标、实现路径和注意事项三个层面回答这个问题。\n\n针对“${question.slice(0, 48)}”，建议先确认业务边界与数据输入，再用小范围可验证的方案实现核心流程。对于后台系统，优先保证权限校验、异常处理、可观测日志和良好的用户反馈。\n\n如果你愿意，我还可以继续把它展开为接口设计、数据结构或可执行代码。`, cot: '根据当前上下文生成结构化回答：先提炼主题，再给出可落地的后台系统实践建议。' };
  };
  const sendMessage = (value = messageInput) => {
    const content = value.trim(); if (!content || isGenerating) return;
    const title = active.messages.length === 0 ? content.slice(0, 20) : active.title;
    const userMessage: Message = { id: `u-${Date.now()}`, role: 'user', content, time: readableTime() };
    const assistantId = `a-${Date.now()}`; const result = getResponse(content);
    const assistant: Message = { id: assistantId, role: 'assistant', content: '', time: readableTime(), model: active.model, code: result.code, cot: result.cot };
    setConversations(previous => previous.map(item => item.id === active.id ? { ...item, title, time: '刚刚', messages: [...item.messages, userMessage, assistant] } : item));
    setMessageInput(''); setIsGenerating(true);
    let cursor = 0;
    streamRef.current = window.setInterval(() => {
      cursor += Math.max(2, Math.ceil(result.text.length / 72));
      const partial = result.text.slice(0, cursor);
      setConversations(previous => previous.map(item => item.id === active.id ? { ...item, messages: item.messages.map(message => message.id === assistantId ? { ...message, content: partial } : message) } : item));
      if (cursor >= result.text.length) { if (streamRef.current) window.clearInterval(streamRef.current); streamRef.current = null; setIsGenerating(false); }
    }, 28);
  };
  const regenerate = () => { const lastUser = [...active.messages].reverse().find(message => message.role === 'user'); if (!lastUser) return toast.warning('当前会话没有可重新生成的问题'); sendMessage(lastUser.content); };
  const copyMessage = async (message: Message) => { try { await navigator.clipboard?.writeText(`${message.content}${message.code ? `\n\n${message.code}` : ''}`); toast.success('内容已复制'); } catch { toast.success('已复制到剪贴板'); } };
  const contextAction = (action: 'rename' | 'pin' | 'delete' | 'export') => {
    const target = conversations.find(item => item.id === contextMenu?.id); if (!target) return;
    if (action === 'rename') { const name = window.prompt('重命名会话', target.title); if (name?.trim()) updateConversation(target.id, { title: name.trim() }); }
    if (action === 'pin') { updateConversation(target.id, { pinned: !target.pinned }); toast.success(target.pinned ? '已取消置顶' : '会话已置顶'); }
    if (action === 'delete') { if (window.confirm(`确定删除会话「${target.title}」吗？`)) { const next = conversations.filter(item => item.id !== target.id); const fallback: Conversation = { id: `c-${Date.now()}`, title: '新对话', model: 'GPT-4o', group: '今天', time: '刚刚', messages: [] }; setConversations(next.length ? next : [fallback]); if (activeId === target.id) setActiveId(next[0]?.id ?? fallback.id); toast.success('会话已删除'); } }
    if (action === 'export') { const markdown = target.messages.map(message => `## ${message.role === 'user' ? '用户' : message.model ?? 'AI'}\n\n${message.content}${message.code ? `\n\n\`\`\`ts\n${message.code}\n\`\`\`` : ''}`).join('\n\n'); const url = URL.createObjectURL(new Blob([`# ${target.title}\n\n${markdown}`], { type: 'text/markdown' })); const link = document.createElement('a'); link.href = url; link.download = `${target.title}.md`; link.click(); URL.revokeObjectURL(url); toast.success('Markdown 已导出'); }
    setContextMenu(null);
  };

  return <AiPageShell title="AI 对话" description="多模型对话工作台，支持流式生成、知识库绑定与模型参数调节。">
    <section className="ai-card ai-workbench">
      <aside className={`ai-side left ${leftOpen ? '' : 'collapsed'}`}><div className="ai-pane-heading"><span>历史会话</span><LowcodeButton primary onClick={newConversation}><MessageCirclePlusIcon size={14} />新建对话</LowcodeButton></div><div className="ai-session-search"><SearchIcon size={14} /><input className="lc-input" placeholder="搜索历史会话" value={query} onChange={event => setQuery(event.target.value)} /></div>{(['今天', '昨天', '更早'] as const).map(group => byGroup(group).length ? <div className="ai-session-group" key={group}><h3>{group}</h3>{byGroup(group).map(session => <button className={`ai-session-row ${session.id === activeId ? 'active' : ''}`} key={session.id} onClick={() => { setActiveId(session.id); setContextMenu(null); }} onContextMenu={event => { event.preventDefault(); setContextMenu({ id: session.id, x: event.clientX, y: event.clientY }); }}><span className="ai-model-mark">{session.model.slice(0, 1)}</span><span style={{ minWidth: 0, flex: 1 }}><b style={{ display: 'block', overflow: 'hidden', fontSize: 12, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.pinned && '📌 '}{session.title}</b><small>{session.model} · {session.time}</small></span><MoreHorizontalIcon size={15} onClick={event => { event.stopPropagation(); setContextMenu({ id: session.id, x: event.clientX - 132, y: event.clientY }); }} /></button>)}</div> : null)}</aside>
      <div className="ai-chat-center"><div className="ai-chat-top"><button className="lc-icon-btn" onClick={() => setLeftOpen(value => !value)} title="收起或展开会话列表">{leftOpen ? <ChevronLeftIcon size={15} /> : <MenuIcon size={15} />}</button>{editingTitle ? <input autoFocus className="ai-chat-title-input" value={active?.title ?? ''} onBlur={() => setEditingTitle(false)} onKeyDown={event => { if (event.key === 'Enter') setEditingTitle(false); }} onChange={event => updateConversation(active.id, { title: event.target.value })} /> : <button className="ai-chat-title" title="点击编辑会话标题" onClick={() => setEditingTitle(true)}>{active?.title || '新对话'} <Edit3Icon size={13} style={{ verticalAlign: -2, marginLeft: 5, opacity: .55 }} /></button>}<select className="lc-select" style={{ width: 120 }} value={active?.model ?? 'GPT-4o'} onChange={event => updateConversation(active.id, { model: event.target.value })}>{modelNames.map(model => <option key={model}>{model}</option>)}</select><button className="lc-icon-btn" onClick={() => { updateConversation(active.id, { messages: [] }); toast.success('对话已清空'); }} title="清空对话"><Trash2Icon size={15} /></button><button className="lc-icon-btn" onClick={() => setRightOpen(value => !value)} title="参数面板">{rightOpen ? <ChevronRightIcon size={15} /> : <MenuIcon size={15} />}</button></div>
        <div className="ai-message-list">{active?.messages.length ? active.messages.map(message => <div key={message.id} className={`ai-message ${message.role}`}><span className="ai-message-avatar">{message.role === 'assistant' ? <BotIcon size={16} /> : '我'}</span><div><div className="ai-message-meta"><span>{message.role === 'assistant' ? message.model : '我'}</span><span>{message.time}</span></div><div className="ai-bubble">{message.content}{isGenerating && message.id === active.messages.at(-1)?.id && <i className="ai-typing-cursor" />}{message.code && !isGenerating && <pre className="ai-code">{message.code}</pre>} {message.cot && <details className="ai-cot"><summary>查看思维过程（CoT）</summary><div style={{ marginTop: 6 }}>{message.cot}</div></details>}</div>{message.role === 'assistant' && <div className="ai-message-actions"><button className="ai-action-icon" title="复制" onClick={() => copyMessage(message)}><CopyIcon size={14} /></button><button className="ai-action-icon" title="重新生成" onClick={regenerate}><UploadIcon size={14} /></button><button className={`ai-action-icon ${message.liked === 'up' ? 'active' : ''}`} title="有帮助" onClick={() => setConversations(prev => prev.map(item => item.id === active.id ? { ...item, messages: item.messages.map(one => one.id === message.id ? { ...one, liked: one.liked === 'up' ? undefined : 'up' } : one) } : item))}><ThumbsUpIcon size={14} /></button><button className={`ai-action-icon ${message.liked === 'down' ? 'active' : ''}`} title="没有帮助" onClick={() => setConversations(prev => prev.map(item => item.id === active.id ? { ...item, messages: item.messages.map(one => one.id === message.id ? { ...one, liked: one.liked === 'down' ? undefined : 'down' } : one) } : item))}><ThumbsDownIcon size={14} /></button></div>}</div></div>) : <div className="ai-empty"><div className="ai-empty-icon"><BotIcon size={29} /></div><h2>今天想聊点什么？</h2><p>选择一个模型，开始你的第一段 AI 对话。</p><div className="ai-suggestion-list">{quickQuestions.map(question => <button className="ai-suggestion" key={question} onClick={() => sendMessage(question)}>{question}</button>)}</div></div>}</div>
        <div className="ai-composer"><div className="ai-compose-box"><textarea placeholder="输入消息，Enter 发送，Shift + Enter 换行" value={messageInput} onChange={event => setMessageInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} />{isGenerating ? <LowcodeButton danger onClick={stopGenerating}><CircleStopIcon size={15} />停止</LowcodeButton> : <LowcodeButton primary disabled={!messageInput.trim()} onClick={() => sendMessage()}><SendIcon size={15} />发送</LowcodeButton>}</div><div className="ai-compose-tools"><div><button className="ai-action-icon" title="上传文件" onClick={() => toast.message('已打开文件上传选择器')}><PaperclipIcon size={15} /></button><button className="ai-action-icon" title="上传图片" onClick={() => toast.message('图片识别功能已启用')}><ImageIcon size={15} /></button><button className="ai-action-icon" title="语音输入" onClick={() => toast.message('语音输入正在监听…')}><Volume2Icon size={15} /></button></div><div><AiSwitch label="联网搜索" checked={params.online} onChange={value => setParams(previous => ({ ...previous, online: value }))} /><AiSwitch label="深度思考" checked={params.deep} onChange={value => setParams(previous => ({ ...previous, deep: value }))} /></div></div></div>
      </div>
      <aside className={`ai-side right ${rightOpen ? '' : 'collapsed'}`}><div className="ai-pane-heading"><span>模型参数</span><button className="lc-icon-btn" onClick={() => setRightOpen(false)}><XIcon size={15} /></button></div><div className="ai-param-body"><div className="lc-field"><div className="ai-range-line"><span>Temperature</span><b>{params.temperature.toFixed(1)}</b></div><input className="ai-range" type="range" min="0" max="2" step="0.1" value={params.temperature} onChange={event => setParams(previous => ({ ...previous, temperature: Number(event.target.value) }))} /></div><div className="lc-field"><div className="ai-range-line"><span>最大 Token</span><b>{params.tokens}K</b></div><input className="ai-range" type="range" min="1" max="128" value={params.tokens} onChange={event => setParams(previous => ({ ...previous, tokens: Number(event.target.value) }))} /></div>{([['topP', 'Top P', 0, 1, .1], ['frequency', '频率惩罚', -2, 2, .1], ['presence', '存在惩罚', -2, 2, .1]] as const).map(([key, label, min, max, step]) => <div className="lc-field" key={key}><div className="ai-range-line"><span>{label}</span><b>{params[key].toFixed(1)}</b></div><input className="ai-range" type="range" min={min} max={max} step={step} value={params[key]} onChange={event => setParams(previous => ({ ...previous, [key]: Number(event.target.value) }))} /></div>)}<div className="lc-field"><label className="lc-label">系统提示词</label><textarea className="lc-textarea" value={params.system} onChange={event => setParams(previous => ({ ...previous, system: event.target.value }))} /></div><div className="lc-field"><label className="lc-label">知识库绑定</label><select multiple className="lc-select" style={{ height: 66 }} value={knowledge} onChange={event => setKnowledge(Array.from(event.target.selectedOptions, option => option.value))}><option>产品帮助中心</option><option>开发者文档</option><option>客服知识库</option></select><div style={{ marginTop: 6 }}>{knowledge.map(item => <span className="ai-pill" key={item}>{item}</span>)}</div></div><div className="lc-field"><label className="lc-label">插件</label>{([{ key: 'online', label: '联网搜索', icon: WifiIcon }, { key: 'code', label: '代码执行', icon: Code2Icon }, { key: 'image', label: '文生图', icon: ImageIcon }] as const).map(item => <div className="ai-plugin-row" key={item.key}><span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><item.icon size={14} />{item.label}</span><AiSwitch checked={params[item.key]} onChange={value => setParams(previous => ({ ...previous, [item.key]: value }))} /></div>)}</div></div></aside>
    </section>
    {contextMenu && <div className="ai-context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={event => event.stopPropagation()}><button onClick={() => contextAction('rename')}><Edit3Icon size={14} />重命名</button><button onClick={() => contextAction('pin')}><CheckIcon size={14} />置顶 / 取消置顶</button><button onClick={() => contextAction('export')}><FileUpIcon size={14} />导出 Markdown</button><button style={{ color: '#F53F3F' }} onClick={() => contextAction('delete')}><Trash2Icon size={14} />删除</button></div>}
  </AiPageShell>;
}
