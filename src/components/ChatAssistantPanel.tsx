import { useRef, useState } from 'react';
import { BotIcon, ImageIcon, PaperclipIcon, SendIcon, SmileIcon, XIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLocale } from '../hooks/useLocale';

interface ChatMessage {
  id: number;
  author: 'user' | 'assistant';
  content: string;
  time: string;
  imageUrl?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: 1, author: 'user', content: '数据分析模块可以帮我查看哪些内容？', time: '10:05' },
  { id: 2, author: 'assistant', content: '可以实时查看访问趋势、用户画像和转化漏斗，也支持导出报表用于复盘。', time: '10:06' },
  { id: 3, author: 'user', content: '好的，我想先从访问统计开始。', time: '10:08' },
  { id: 4, author: 'assistant', content: '没问题。进入数据分析的“访问统计”，即可按来源、设备和日期查看趋势。', time: '10:09' },
];

const EMOJIS = [
  '😀', '😃', '😄', '😁', '😊', '😍', '🥳', '🤩', '😂', '😭', '😎', '🤔',
  '😮', '😴', '😡', '🙌', '👏', '👍', '👎', '🙏', '💪', '🎉', '🔥', '✅',
  '⭐', '💡', '🚀', '❤️', '💯', '📌', '📈', '🎯', '☕', '🌈', '✨', '🎁',
];

const KAOMOJIS = ['(＾▽＾)', '(≧▽≦)', '(｡•̀ᴗ-)✧', 'ヽ(✿ﾟ▽ﾟ)ノ', '(๑•̀ㅂ•́)و✧', '(✿◡‿◡)', '(づ｡◕‿‿◕｡)づ', '(╯°□°）╯︵ ┻━┻', '¯\\_(ツ)_/¯', '٩(ˊᗜˋ*)و', '(´• ω •`)', 'ฅ^•ﻌ•^ฅ'];

interface ChatAssistantPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function ChatAssistantPanel({ open, onClose }: ChatAssistantPanelProps) {
  const { themeState } = useTheme();
  const { locale } = useLocale();
  const primary = themeState.themeId === 'manga' ? '#E91E8C' : 'var(--primary)';
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [expressionType, setExpressionType] = useState<'emoji' | 'kaomoji'>('emoji');
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const appendConversation = (content: string, reply: string, imageUrl?: string) => {
    const time = new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
    setMessages(previous => [
      ...previous,
      { id: Date.now(), author: 'user', content, time, imageUrl },
      { id: Date.now() + 1, author: 'assistant', content: reply, time },
    ]);
  };

  const sendMessage = () => {
    const content = input.trim();
    if (!content) return;
    appendConversation(content, '已收到。AO 助手会根据当前模块为你整理下一步操作建议。');
    setInput('');
  };

  const addEmoji = (emoji: string) => {
    setInput(value => `${value}${emoji}`);
    setEmojiPickerOpen(false);
  };

  const sendAttachment = (file?: File) => {
    if (!file) return;
    appendConversation(`📎 附件：${file.name}`, `已收到附件“${file.name}”，我会结合附件内容继续协助你。`);
    if (attachmentInputRef.current) attachmentInputRef.current.value = '';
  };

  const sendImage = (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => appendConversation(`🖼️ 图片：${file.name}`, `已收到图片“${file.name}”，我会根据图片内容继续协助你。`, String(reader.result));
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  if (!open) return null;

  return (
    <div
      data-cmp="ChatAssistantPanel"
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'rgba(15,23,42,0.48)', display: 'flex', justifyContent: 'flex-end' }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="AO 助手聊天"
        onClick={event => event.stopPropagation()}
        style={{ width: 'min(480px, 100vw)', height: '100%', background: 'var(--card)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', boxShadow: '-16px 0 36px rgba(0,0,0,0.14)' }}
      >
        <header className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: primary }}><BotIcon size={18} /></div>
            <div><div className="font-semibold" style={{ color: 'var(--foreground)' }}>AO 助手</div><div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: '#16A34A' }}><span className="h-1.5 w-1.5 rounded-full bg-green-500" />在线</div></div>
          </div>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }} title="关闭聊天"><XIcon size={18} /></button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5" style={{ background: 'var(--background)' }}>
          {messages.map(message => (
            <div key={message.id} className={`flex gap-2.5 ${message.author === 'user' ? 'justify-end' : 'justify-start'}`}>
              {message.author === 'assistant' && <div className="mt-5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs text-white" style={{ background: primary }}><BotIcon size={14} /></div>}
              <div className="max-w-[78%]">
                <div className={`mb-1 flex items-center gap-2 text-xs ${message.author === 'user' ? 'justify-end' : ''}`} style={{ color: 'var(--muted-foreground)' }}><span>{message.author === 'user' ? '管理员' : 'AO 助手'}</span><span>{message.time}</span></div>
                <div className="rounded-xl px-3.5 py-2.5 text-sm leading-6" style={{ background: message.author === 'user' ? `${primary}18` : 'var(--card)', color: 'var(--foreground)', border: message.author === 'user' ? `1px solid ${primary}24` : '1px solid var(--border)' }}>
                  {message.imageUrl && <img src={message.imageUrl} alt="聊天图片附件" className="mb-2 max-h-52 w-full rounded-lg object-cover" />}
                  {message.content}
                </div>
              </div>
              {message.author === 'user' && <div className="mt-5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: 'var(--primary)' }}>管</div>}
            </div>
          ))}
        </div>

        <footer className="border-t p-4" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); } }} placeholder="输入消息，Enter 发送" rows={3} className="w-full resize-none rounded-lg border p-3 text-sm outline-none" style={{ borderColor: 'var(--border)', background: 'var(--input)', color: 'var(--foreground)' }} />
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1">
              <div style={{ position: 'relative' }}>
                <button type="button" onClick={() => setEmojiPickerOpen(open => !open)} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }} title="添加表情"><SmileIcon size={18} /></button>
                {emojiPickerOpen && <div className="absolute bottom-10 left-0 z-10 w-72 rounded-xl border p-2 shadow-lg" style={{ borderColor: 'var(--border)', background: 'var(--popover)' }}>
                  <div className="mb-2 flex gap-1 border-b pb-2" style={{ borderColor: 'var(--border)' }}>
                    {([['emoji', '表情'], ['kaomoji', '颜文字']] as const).map(([type, label]) => <button key={type} type="button" onClick={() => setExpressionType(type)} className="rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: expressionType === type ? 'var(--accent)' : 'transparent', color: expressionType === type ? 'var(--accent-foreground)' : 'var(--muted-foreground)' }}>{label}</button>)}
                  </div>
                  <div className={expressionType === 'emoji' ? 'grid grid-cols-6 gap-1' : 'grid grid-cols-2 gap-1'}>{(expressionType === 'emoji' ? EMOJIS : KAOMOJIS).map(expression => <button key={expression} type="button" onClick={() => addEmoji(expression)} className="flex h-8 items-center justify-center rounded-md px-1 text-sm hover:bg-accent" title={`插入 ${expression}`}>{expression}</button>)}</div>
                </div>}
              </div>
              <button type="button" onClick={() => imageInputRef.current?.click()} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }} title="发送图片"><ImageIcon size={17} /></button>
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={event => sendImage(event.target.files?.[0])} />
              <button type="button" onClick={() => attachmentInputRef.current?.click()} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent" style={{ color: 'var(--muted-foreground)' }} title="发送附件"><PaperclipIcon size={17} /></button>
              <input ref={attachmentInputRef} type="file" className="hidden" onChange={event => sendAttachment(event.target.files?.[0])} />
            </div>
            <button type="button" onClick={sendMessage} disabled={!input.trim()} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-45" style={{ background: primary }}><SendIcon size={14} />发送</button>
          </div>
        </footer>
      </aside>
    </div>
  );
}
