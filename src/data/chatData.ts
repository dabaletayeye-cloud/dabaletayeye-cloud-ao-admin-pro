export type MsgRole = 'me' | 'them';

export interface ChatMessage {
  id: number;
  role: MsgRole;
  text: string;
  ts: number; // unix ms
}

export interface Conversation {
  id: number;
  name: string;
  avatar: string;       // emoji fallback
  avatarBg: string;     // hex
  lastMsg: string;
  lastTs: number;
  unread: number;
  online: boolean;
  messages: ChatMessage[];
}

function ts(minAgo: number) {
  return Date.now() - minAgo * 60 * 1000;
}

/* ─── auto-reply pool ─────────────────────────────────────── */
export const AUTO_REPLIES: string[] = [
  '好的，收到了！',
  '明白，我这边再看看。',
  '嗯嗯，稍等一下哦 😊',
  '这个问题我来确认下，等我消息。',
  '没问题，马上处理！',
  '了解，我同步给相关同学。',
  '哈哈，可以的！',
  '这个我觉得挺好的，继续推进吧。',
  '好，我记下来了 📝',
  '稍微想想哈，给你回复。',
  '感谢提醒，太棒了 👍',
  '已经在处理了，放心～',
  '这个方案可以，我支持。',
  '明白了，我晚些时候再看一下。',
  '收到！有进展再通知你。',
];

/* ─── conversations ───────────────────────────────────────── */
export const INIT_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: '林晓薇',
    avatar: '🧑‍💻',
    avatarBg: '#6366f1',
    online: true,
    unread: 3,
    lastMsg: '那个 PR 你有时间看一下吗？',
    lastTs: ts(2),
    messages: [
      { id: 1, role: 'them', text: '早！今天的站会你参加吗？', ts: ts(62) },
      { id: 2, role: 'me',   text: '参加的，9:15 对吧？', ts: ts(60) },
      { id: 3, role: 'them', text: '对的，我已经拉了 Zoom 链接。', ts: ts(58) },
      { id: 4, role: 'me',   text: '收到，待会见！', ts: ts(55) },
      { id: 5, role: 'them', text: '还有，那个关于用户画像的需求文档我发给你了，帮我看看有没有遗漏的地方。', ts: ts(30) },
      { id: 6, role: 'me',   text: '好的，我看完再给你反馈。', ts: ts(28) },
      { id: 7, role: 'them', text: '那个 PR 你有时间看一下吗？', ts: ts(2) },
    ],
  },
  {
    id: 2,
    name: '产品讨论群',
    avatar: '💬',
    avatarBg: '#14b8a6',
    online: true,
    unread: 12,
    lastMsg: '赵明：下周的发布计划确认了吗',
    lastTs: ts(5),
    messages: [
      { id: 1, role: 'them', text: '大家看一下这周的迭代计划，有问题及时提出。', ts: ts(120) },
      { id: 2, role: 'me',   text: '我这边功能基本完成，剩下一些边界处理。', ts: ts(115) },
      { id: 3, role: 'them', text: '好，测试同学什么时候可以介入？', ts: ts(112) },
      { id: 4, role: 'me',   text: '明天下午应该可以。', ts: ts(110) },
      { id: 5, role: 'them', text: '好的，测试环境我已经更新了最新包。', ts: ts(80) },
      { id: 6, role: 'them', text: '顺便，UI 稿有个小改动，@前端同学留意一下。', ts: ts(50) },
      { id: 7, role: 'me',   text: '收到，我来跟进。', ts: ts(45) },
      { id: 8, role: 'them', text: '赵明：下周的发布计划确认了吗', ts: ts(5) },
    ],
  },
  {
    id: 3,
    name: '陈志远',
    avatar: '👨‍🎨',
    avatarBg: '#f43f5e',
    online: false,
    unread: 0,
    lastMsg: '新版设计稿已上传 Figma',
    lastTs: ts(40),
    messages: [
      { id: 1, role: 'them', text: '你好，Dashboard 的改版方案我重新整理了一版。', ts: ts(200) },
      { id: 2, role: 'me',   text: '好的，发我看看？', ts: ts(198) },
      { id: 3, role: 'them', text: '主要是侧边栏缩进和颜色系统做了调整，更符合当前设计规范。', ts: ts(190) },
      { id: 4, role: 'me',   text: '嗯，看起来清爽多了，继续按这个方向走。', ts: ts(180) },
      { id: 5, role: 'them', text: '新版设计稿已上传 Figma', ts: ts(40) },
    ],
  },
  {
    id: 4,
    name: '王雅婷',
    avatar: '👩‍💼',
    avatarBg: '#f59e0b',
    online: true,
    unread: 1,
    lastMsg: '合同那边需要你签字确认',
    lastTs: ts(15),
    messages: [
      { id: 1, role: 'them', text: '你好，Q2 的预算申请表填好了吗？', ts: ts(300) },
      { id: 2, role: 'me',   text: '还没，今天下班前提交可以吗？', ts: ts(295) },
      { id: 3, role: 'them', text: '可以，截止今晚 18:00。', ts: ts(290) },
      { id: 4, role: 'me',   text: '好的，我马上填。', ts: ts(280) },
      { id: 5, role: 'them', text: '合同那边需要你签字确认', ts: ts(15) },
    ],
  },
  {
    id: 5,
    name: '张浩然',
    avatar: '🧑‍🔧',
    avatarBg: '#a78bfa',
    online: false,
    unread: 0,
    lastMsg: '服务器监控报警了，我看一下',
    lastTs: ts(90),
    messages: [
      { id: 1, role: 'me',   text: '线上 API 响应好像变慢了？', ts: ts(200) },
      { id: 2, role: 'them', text: '我查一下，可能是昨晚的部署引入了问题。', ts: ts(195) },
      { id: 3, role: 'me',   text: '好，有结论了告诉我。', ts: ts(193) },
      { id: 4, role: 'them', text: '排查了，是某个索引没建，已经修复了。', ts: ts(180) },
      { id: 5, role: 'me',   text: '好的，谢谢！', ts: ts(178) },
      { id: 6, role: 'them', text: '服务器监控报警了，我看一下', ts: ts(90) },
    ],
  },
  {
    id: 6,
    name: '运营小助手',
    avatar: '🤖',
    avatarBg: '#34d399',
    online: true,
    unread: 0,
    lastMsg: '本周活动数据报告已生成',
    lastTs: ts(180),
    messages: [
      { id: 1, role: 'them', text: '【系统通知】五一大促活动已正式上线，请关注流量情况。', ts: ts(600) },
      { id: 2, role: 'me',   text: '收到，我盯着呢。', ts: ts(595) },
      { id: 3, role: 'them', text: '活动期间峰值流量是平时的 4.2 倍，系统运行正常。', ts: ts(300) },
      { id: 4, role: 'them', text: '本周活动数据报告已生成', ts: ts(180) },
    ],
  },
];

/* ─── time format util ────────────────────────────────────── */
export function fmtTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (diffH < 48) return '昨天';
  return `${d.getMonth()+1}/${d.getDate()}`;
}

export function fmtMsgTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDay = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const hm = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (diffDay === 0) return `今天 ${hm}`;
  if (diffDay === 1) return `昨天 ${hm}`;
  return `${d.getMonth()+1}月${d.getDate()}日 ${hm}`;
}
