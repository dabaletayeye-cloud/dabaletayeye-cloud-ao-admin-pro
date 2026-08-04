import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../../lib/localizedToast';
import AdminLayout from '../../components/AdminLayout';
import { useTheme } from '../../hooks/useTheme';
import { localizeText } from '../../i18n/localizeText';
import {
  SendIcon,
  SearchIcon,
  PhoneIcon,
  VideoIcon,
  MoreHorizontalIcon,
  SmileIcon,
  PaperclipIcon,
  CheckCheckIcon,
  WifiOffIcon,
} from 'lucide-react';
import {
  Conversation,
  ChatMessage,
  AUTO_REPLIES,
  INIT_CONVERSATIONS,
  fmtTime,
  fmtMsgTime,
} from '../../data/chatData';

/* ──────────────────────────────────────────────────────────────
   Helpers
────────────────────────────────────────────────────────────── */
let nextId = 1000;
function newId() { return ++nextId; }

function shouldShowTimeDivider(prev: ChatMessage | undefined, cur: ChatMessage): boolean {
  if (!prev) return true;
  return cur.ts - prev.ts > 5 * 60 * 1000; // gap > 5 min
}

/* ──────────────────────────────────────────────────────────────
   Avatar
────────────────────────────────────────────────────────────── */
function Avatar({
  conv,
  size = 40,
  showOnline = false,
}: {
  conv: Conversation;
  size?: number;
  showOnline?: boolean;
}) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: conv.avatarBg + '33',
          border: `2px solid ${conv.avatarBg}55`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.45,
          userSelect: 'none',
        }}
      >
        {conv.avatar}
      </div>
      {showOnline && (
        <span
          style={{
            position: 'absolute',
            bottom: 1,
            right: 1,
            width: 9,
            height: 9,
            borderRadius: '50%',
            background: conv.online ? '#22c55e' : '#9ca3af',
            border: '2px solid var(--card)',
          }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ConvItem  (left panel row)
────────────────────────────────────────────────────────────── */
function ConvItem({
  conv,
  active,
  accentHex,
  language,
  tx,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  accentHex: string;
  language: string;
  tx: (value: string) => string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 11,
        width: '100%',
        padding: '10px 14px',
        border: 'none',
        background: active ? accentHex + '15' : 'transparent',
        borderLeft: active ? `3px solid ${accentHex}` : '3px solid transparent',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background .12s',
      }}
      onMouseEnter={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--muted)';
      }}
      onMouseLeave={e => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      <Avatar conv={conv} size={42} showOnline />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{
            fontSize: 13,
            fontWeight: active ? 700 : 600,
            color: active ? accentHex : 'var(--foreground)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 120,
          }}>
            {tx(conv.name)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--muted-foreground)', flexShrink: 0 }}>
            {fmtTime(conv.lastTs, language)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 12,
            color: 'var(--muted-foreground)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            marginRight: 6,
          }}>
            {tx(conv.lastMsg)}
          </span>
          {conv.unread > 0 && (
            <span style={{
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: accentHex,
              color: '#fff',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              flexShrink: 0,
            }}>
              {conv.unread > 99 ? '99+' : conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ──────────────────────────────────────────────────────────────
   Bubble
────────────────────────────────────────────────────────────── */
function Bubble({
  msg,
  conv,
  accentHex,
  tx,
}: {
  msg: ChatMessage;
  conv: Conversation;
  accentHex: string;
  tx: (value: string) => string;
}) {
  const isMe = msg.role === 'me';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMe ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: 8,
        maxWidth: '72%',
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        animation: 'bubble-in .18s ease',
      }}
    >
      {/* avatar (them only) */}
      {!isMe && (
        <Avatar conv={conv} size={30} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', gap: 3 }}>
        <div
          style={{
            padding: '9px 14px',
            borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            background: isMe
              ? `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`
              : 'var(--muted)',
            color: isMe ? '#fff' : 'var(--foreground)',
            fontSize: 13,
            lineHeight: 1.6,
            wordBreak: 'break-word',
            boxShadow: isMe
              ? `0 2px 8px ${accentHex}44`
              : '0 1px 4px rgba(0,0,0,.06)',
            maxWidth: '100%',
          }}
        >
          {tx(msg.text)}
        </div>
        {/* timestamp + read */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 10,
          color: 'var(--muted-foreground)',
        }}>
          {isMe && <CheckCheckIcon size={11} style={{ opacity: 0.6 }} />}
          <span>{`${String(new Date(msg.ts).getHours()).padStart(2,'0')}:${String(new Date(msg.ts).getMinutes()).padStart(2,'0')}`}</span>
        </div>
      </div>

      {/* avatar placeholder (me side, keeps alignment) */}
      {isMe && <div style={{ width: 30, flexShrink: 0 }} />}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   TimeDivider
────────────────────────────────────────────────────────────── */
function TimeDivider({ ts, language }: { ts: number; language: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 0',
      userSelect: 'none',
    }}>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      <span style={{ fontSize: 11, color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>
        {fmtMsgTime(ts, language)}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   TypingIndicator
────────────────────────────────────────────────────────────── */
function TypingIndicator({ conv }: { conv: Conversation }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      gap: 8,
      alignSelf: 'flex-start',
      animation: 'bubble-in .18s ease',
    }}>
      <Avatar conv={conv} size={30} />
      <div style={{
        padding: '10px 16px',
        borderRadius: '4px 16px 16px 16px',
        background: 'var(--muted)',
        display: 'flex',
        gap: 4,
        alignItems: 'center',
      }}>
        {[0, 1, 2].map(i => (
          <span
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--muted-foreground)',
              display: 'inline-block',
              animation: `typing-dot .9s ${i * 0.18}s infinite`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   ChatPage
────────────────────────────────────────────────────────────── */
export default function ChatPage() {
  const { themeState } = useTheme();
  const { i18n } = useTranslation();
  const language = i18n.resolvedLanguage ?? i18n.language;
  const tx = useCallback((value: string) => localizeText(value, language), [language]);
  const isManga = themeState.themeId === 'manga';
  const isDark = themeState.mode === 'dark';
  const accentHex = isManga ? '#E91E8C' : '#6366f1';

  const [convs, setConvs] = useState<Conversation[]>(
    () => INIT_CONVERSATIONS.map(c => ({ ...c, messages: [...c.messages] }))
  );
  const [activeId, setActiveId] = useState<number>(1);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [typing, setTyping] = useState(false);

  const msgEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeConv = convs.find(c => c.id === activeId) ?? convs[0];

  /* scroll to bottom */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages.length, typing]);

  /* clear unread on switch */
  function selectConv(id: number) {
    setActiveId(id);
    setConvs(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    setTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
  }

  /* send message */
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const myMsg: ChatMessage = { id: newId(), role: 'me', text, ts: Date.now() };

    setConvs(prev => prev.map(c => {
      if (c.id !== activeId) return c;
      return {
        ...c,
        messages: [...c.messages, myMsg],
        lastMsg: text,
        lastTs: myMsg.ts,
      };
    }));
    setInput('');
    inputRef.current?.focus();

    /* simulate auto-reply */
    const delay = 800 + Math.random() * 1200;
    setTyping(true);

    typingTimer.current = setTimeout(() => {
      setTyping(false);
      const replyText = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const replyMsg: ChatMessage = { id: newId(), role: 'them', text: replyText, ts: Date.now() };
      setConvs(prev => prev.map(c => {
        if (c.id !== activeId) return c;
        return {
          ...c,
          messages: [...c.messages, replyMsg],
          lastMsg: replyText,
          lastTs: replyMsg.ts,
        };
      }));
    }, delay);
  }, [input, activeId]);

  /* Enter to send, Shift+Enter newline */
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  /* search filter */
  const filteredConvs = search.trim()
    ? convs.filter(c =>
        tx(c.name).toLowerCase().includes(search.toLowerCase()) ||
        tx(c.lastMsg).toLowerCase().includes(search.toLowerCase())
      )
    : convs;

  const messages = activeConv?.messages ?? [];

  return (
    <AdminLayout>
      <style>{`
        @keyframes chat-fade {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes bubble-in {
          from { opacity:0; transform:scale(.94) translateY(4px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes typing-dot {
          0%,80%,100% { transform:scale(1); opacity:.4; }
          40%          { transform:scale(1.4); opacity:1; }
        }
        .chat-input-area::-webkit-scrollbar { width:4px; }
        .chat-input-area::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .msg-list::-webkit-scrollbar { width:5px; }
        .msg-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:3px; }
        .conv-list::-webkit-scrollbar { width:4px; }
        .conv-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
      `}</style>

      <div
        data-cmp="ChatPage"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          animation: 'chat-fade .3s ease',
          gap: 16,
        }}
      >
        {/* ── page title ── */}
        <div style={{ flexShrink: 0 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--foreground)' }}>
            {tx('聊天模板')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--muted-foreground)' }}>
            {tx('会话列表 · 气泡消息 · 自动回复模拟')}
          </p>
        </div>

        {/* ── chat shell ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          border: '1px solid var(--border)',
          borderRadius: 14,
          overflow: 'hidden',
          background: 'var(--card)',
          boxShadow: 'var(--shadow-x,0px) var(--shadow-y,2px) var(--shadow-blur,10px) var(--shadow-spread,0px) var(--shadow-color,rgba(0,0,0,.06))',
        }}>

          {/* ════ LEFT: conversation list ════ */}
          <div style={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            background: isDark ? 'rgba(255,255,255,.02)' : 'rgba(0,0,0,.01)',
          }}>
            {/* search */}
            <div style={{ padding: '14px 12px 10px', flexShrink: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--muted)',
                borderRadius: 9,
                padding: '7px 11px',
              }}>
                <SearchIcon size={13} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={tx('搜索对话...')}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: 12,
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>

            {/* list */}
            <div className="conv-list" style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConvs.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 12 }}>
                  {tx('无匹配对话')}
                </div>
              ) : (
                filteredConvs.map(conv => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    active={conv.id === activeId}
                    accentHex={accentHex}
                    language={language}
                    tx={tx}
                    onClick={() => selectConv(conv.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* ════ RIGHT: chat window ════ */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

            {/* ── topbar ── */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 18px',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <Avatar conv={activeConv} size={38} showOnline />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>
                  {tx(activeConv.name)}
                </div>
                <div style={{
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  color: activeConv.online ? '#22c55e' : 'var(--muted-foreground)',
                }}>
                  {activeConv.online
                    ? <><span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e', display:'inline-block' }} />{tx('在线')}</>
                    : <><WifiOffIcon size={10} />{tx('离线')}</>
                  }
                </div>
              </div>
              {/* action buttons */}
              <div style={{ display: 'flex', gap: 6 }}>
                {([
                  { icon: <PhoneIcon size={15} />, label: '语音' },
                  { icon: <VideoIcon size={15} />, label: '视频' },
                  { icon: <MoreHorizontalIcon size={15} />, label: '更多' },
                ] as { icon: React.ReactNode; label: string }[]).map(btn => (
                  <button
                    key={btn.label}
                    title={btn.label}
                    onClick={() => toast.info(`${btn.label}功能已打开`)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                      background: 'var(--muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted-foreground)',
                    }}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* ── messages ── */}
            <div
              className="msg-list"
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {messages.map((msg, idx) => {
                const prev = messages[idx - 1];
                const showDivider = shouldShowTimeDivider(prev, msg);
                return (
                  <React.Fragment key={msg.id}>
                    {showDivider && <TimeDivider ts={msg.ts} language={language} />}
                    <Bubble msg={msg} conv={activeConv} accentHex={accentHex} tx={tx} />
                  </React.Fragment>
                );
              })}

              {/* typing indicator */}
              <div style={{ display: typing ? 'flex' : 'none' }}>
                <TypingIndicator conv={activeConv} />
              </div>

              <div ref={msgEndRef} />
            </div>

            {/* ── input bar ── */}
            <div style={{
              borderTop: '1px solid var(--border)',
              padding: '10px 14px 12px',
              flexShrink: 0,
              background: isDark ? 'rgba(255,255,255,.015)' : 'rgba(0,0,0,.008)',
            }}>
              {/* toolbar */}
              <div style={{
                display: 'flex',
                gap: 6,
                marginBottom: 8,
              }}>
                {([
                  { icon: <SmileIcon size={16} />, label: '表情' },
                  { icon: <PaperclipIcon size={16} />, label: '附件' },
                ] as { icon: React.ReactNode; label: string }[]).map(btn => (
                  <button
                    key={btn.label}
                    title={btn.label}
                    onClick={() => toast.info(`${btn.label}功能已打开`)}
                    style={{
                      width: 30,
                      height: 30,
                      border: 'none',
                      borderRadius: 7,
                      background: 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--muted-foreground)',
                      transition: 'background .12s, color .12s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--muted)';
                      (e.currentTarget as HTMLElement).style.color = accentHex;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)';
                    }}
                  >
                    {btn.icon}
                  </button>
                ))}
              </div>

              {/* textarea + send */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                <textarea
                  ref={inputRef}
                  className="chat-input-area"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={tx('输入消息…  Enter 发送，Shift+Enter 换行')}
                  rows={2}
                  style={{
                    flex: 1,
                    resize: 'none',
                    border: `1px solid ${input.trim() ? accentHex + '66' : 'var(--border)'}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 13,
                    lineHeight: 1.6,
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    outline: 'none',
                    transition: 'border-color .15s',
                    overflowY: 'auto',
                    maxHeight: 100,
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    border: 'none',
                    background: input.trim()
                      ? `linear-gradient(135deg, ${accentHex}, ${accentHex}cc)`
                      : 'var(--muted)',
                    color: input.trim() ? '#fff' : 'var(--muted-foreground)',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all .15s',
                    boxShadow: input.trim() ? `0 3px 10px ${accentHex}44` : 'none',
                  }}
                >
                  <SendIcon size={17} />
                </button>
              </div>

              {/* hint */}
              <div style={{ marginTop: 5, fontSize: 11, color: 'var(--muted-foreground)', paddingLeft: 2 }}>
                {tx('Enter 发送 · Shift+Enter 换行 · 发送后将模拟自动回复')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
