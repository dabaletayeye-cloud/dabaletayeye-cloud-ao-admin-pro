export interface CalEvent {
  id: number;
  date: string; // 'YYYY-MM-DD'
  title: string;
  color: string; // tailwind-like token mapped to hex below
  time: string;
  desc: string;
}

// color tokens → hex (暗亮通用，高饱和)
export const EVENT_COLORS: Record<string, string> = {
  indigo:  '#6366f1',
  rose:    '#f43f5e',
  amber:   '#f59e0b',
  teal:    '#14b8a6',
  violet:  '#a78bfa',
  sky:     '#38bdf8',
  emerald: '#34d399',
  pink:    '#ec4899',
  orange:  '#fb923c',
};

function d(y: number, m: number, day: number) {
  return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

const now = new Date();
const Y = now.getFullYear();
const M = now.getMonth() + 1;

export const MOCK_EVENTS: CalEvent[] = [
  // 当月丰富示例
  { id:1,  date: d(Y,M,1),  title:'月度复盘会议',     color:'indigo', time:'09:00', desc:'各部门负责人汇报上月进度，梳理本月 OKR。' },
  { id:2,  date: d(Y,M,2),  title:'产品路线图评审',    color:'violet', time:'14:00', desc:'讨论 Q2 产品规划，确认需求优先级。' },
  { id:3,  date: d(Y,M,3),  title:'前端 Code Review',  color:'teal',   time:'11:00', desc:'本周 PR 集中评审，关注性能优化部分。' },
  { id:4,  date: d(Y,M,5),  title:'用户访谈',          color:'rose',   time:'15:30', desc:'约谈 5 位核心用户，收集新功能反馈。' },
  { id:5,  date: d(Y,M,5),  title:'设计评审',          color:'amber',  time:'10:00', desc:'新版 Dashboard UI 设计稿走查。' },
  { id:6,  date: d(Y,M,7),  title:'团建活动',          color:'pink',   time:'17:00', desc:'全员户外拓展，请提前确认参与人数。' },
  { id:7,  date: d(Y,M,8),  title:'数据库迁移',        color:'sky',    time:'23:00', desc:'将生产库从 v14 升级至 v16，低峰期执行。' },
  { id:8,  date: d(Y,M,10), title:'Q2 启动会',         color:'indigo', time:'09:30', desc:'发布本季度目标，全员大会。' },
  { id:9,  date: d(Y,M,12), title:'运营活动上线',      color:'orange', time:'10:00', desc:'五一大促活动正式开始，监控流量波峰。' },
  { id:10, date: d(Y,M,12), title:'安全漏洞修复发布',  color:'rose',   time:'14:00', desc:'修复 CVE-2024-0001，提前通知客户。' },
  { id:11, date: d(Y,M,14), title:'合作伙伴对接',      color:'teal',   time:'13:00', desc:'与第三方支付供应商确认接口文档。' },
  { id:12, date: d(Y,M,15), title:'版本发布 v2.4.0',   color:'emerald',time:'18:00', desc:'灰度发布，覆盖 20% 用户，观察 24h。' },
  { id:13, date: d(Y,M,15), title:'投资人季报汇报',    color:'violet', time:'16:00', desc:'准备财务数据、增长指标 PPT。' },
  { id:14, date: d(Y,M,17), title:'新员工入职培训',    color:'sky',    time:'10:00', desc:'本月 3 位新成员，安排技术栈培训。' },
  { id:15, date: d(Y,M,18), title:'SEO 优化评审',      color:'amber',  time:'14:30', desc:'核查外链建设和关键词排名变化。' },
  { id:16, date: d(Y,M,20), title:'全栈技术分享',      color:'indigo', time:'19:00', desc:'内部 Tech Talk，主题：React Server Components。' },
  { id:17, date: d(Y,M,21), title:'竞品分析报告',      color:'pink',   time:'11:00', desc:'对标三家竞品，输出功能差异矩阵。' },
  { id:18, date: d(Y,M,22), title:'CI/CD 流水线优化',  color:'teal',   time:'15:00', desc:'缩短构建时间至 3min 以内。' },
  { id:19, date: d(Y,M,23), title:'客服系统升级培训',  color:'orange', time:'13:30', desc:'新工单系统上线前的操作培训。' },
  { id:20, date: d(Y,M,25), title:'月度 KPI 确认',     color:'rose',   time:'09:00', desc:'确认各岗位月度指标完成情况。' },
  { id:21, date: d(Y,M,25), title:'API 文档更新',      color:'sky',    time:'16:00', desc:'同步最新接口变更，发布 Swagger。' },
  { id:22, date: d(Y,M,26), title:'广告投放复盘',      color:'violet', time:'14:00', desc:'ROI 分析与下月预算调整。' },
  { id:23, date: d(Y,M,28), title:'Sprint 回顾',       color:'emerald',time:'17:00', desc:'本迭代速度与质量回顾，记录改进项。' },
  { id:24, date: d(Y,M,28), title:'离职交接',          color:'amber',  time:'11:00', desc:'设计师离职，资产移交与知识沉淀。' },
  // 今天额外追加
  { id:25, date: d(Y,M,now.getDate()), title:'今日站会',  color:'indigo', time:'09:15', desc:'15 分钟同步：昨日进展、今日计划、阻塞项。' },
  { id:26, date: d(Y,M,now.getDate()), title:'午餐分享会', color:'pink', time:'12:00', desc:'聊聊最近读的技术好文，轻松交流。' },
  // 上个月末
  { id:27, date: d(M-1<1?Y-1:Y,M-1<1?12:M-1,28), title:'季度财务结算', color:'rose',   time:'16:00', desc:'账期截止，核对所有应付款项。' },
  { id:28, date: d(M-1<1?Y-1:Y,M-1<1?12:M-1,29), title:'节前布置',     color:'amber',  time:'14:00', desc:'节假日前系统巡检、值班安排。' },
  // 下个月初
  { id:29, date: d(M+1>12?Y+1:Y,M+1>12?1:M+1,2),  title:'Q3 规划启动', color:'violet', time:'10:00', desc:'战略会议，确认下季度大方向。' },
  { id:30, date: d(M+1>12?Y+1:Y,M+1>12?1:M+1,3),  title:'新功能灰度',  color:'teal',   time:'08:00', desc:'智能推荐功能 5% 灰度放量。' },
];

export function getEventsForDate(date: string): CalEvent[] {
  return MOCK_EVENTS.filter(e => e.date === date);
}

export function getEventsForMonth(year: number, month: number): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  MOCK_EVENTS.forEach(e => {
    const [ey, em] = e.date.split('-').map(Number);
    // include prev/next month overflow too
    if (
      (ey === year && em === month) ||
      (ey === year && em === month - 1) ||
      (ey === year && em === month + 1) ||
      (ey === year - 1 && month === 1 && em === 12) ||
      (ey === year + 1 && month === 12 && em === 1)
    ) {
      const list = map.get(e.date) ?? [];
      list.push(e);
      map.set(e.date, list);
    }
  });
  return map;
}

export function getEventsForWeek(weekDates: string[]): Map<string, CalEvent[]> {
  const map = new Map<string, CalEvent[]>();
  weekDates.forEach(d => {
    const evs = MOCK_EVENTS.filter(e => e.date === d);
    if (evs.length) map.set(d, evs);
  });
  return map;
}
