export const oaFieldOptions: Record<string, Record<string, string>> = {
  approval_type: { leave: '请假', expense: '报销', seal: '用印', out: '外出', overtime: '加班' },
  notice_type: { notice: '通知', announcement: '公告', policy: '制度' },
  schedule_type: { meeting: '会议', business_trip: '出差', task: '任务', personal: '个人日程', other: '其他' },
  is_top: { '0': '否', '1': '是' },
};

const statusLabels: Record<string, Record<string, string>> = {
  attendance: { normal: '正常', late: '迟到', early: '早退', absent: '缺勤', leave: '请假' },
  approval: { pending: '待审批', approved: '已通过', rejected: '已驳回', cancelled: '已撤销' },
  notices: { draft: '草稿', published: '已发布', withdrawn: '已撤回' },
};

export function formatOaValue(resource: string, field: string, value: unknown): string {
  if (value === null || value === undefined || value === '') return '-';
  const key = field === 'is_top' && typeof value === 'boolean' ? (value ? '1' : '0') : String(value);
  const labels = field === 'status' ? statusLabels[resource] : oaFieldOptions[field];
  return labels?.[key] ?? key;
}
