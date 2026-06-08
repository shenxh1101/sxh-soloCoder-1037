import { formatDistanceToNow, format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import type { Priority, RequirementStatus, UserRole, MilestoneStatus, RiskImpact, RiskProbability, RiskStatus, PendingItemType } from '../types';

export const formatDate = (date: string | Date | null): string => {
  if (!date) return '-';
  return format(new Date(date), 'yyyy-MM-dd', { locale: zhCN });
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return '-';
  return format(new Date(date), 'yyyy-MM-dd HH:mm', { locale: zhCN });
};

export const formatRelativeTime = (date: string | Date | null): string => {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export const getPriorityLabel = (priority: Priority): string => {
  const labels: Record<Priority, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return labels[priority];
};

export const getStatusLabel = (status: RequirementStatus): string => {
  const labels: Record<RequirementStatus, string> = {
    todo: '待开始',
    'in-progress': '进行中',
    testing: '测试中',
    done: '已完成',
    cancelled: '已取消',
  };
  return labels[status];
};

export const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    product: '产品经理',
    designer: '设计师',
    developer: '开发工程师',
    admin: '管理员',
  };
  return labels[role];
};

export const getMilestoneStatusLabel = (status: MilestoneStatus): string => {
  const labels: Record<MilestoneStatus, string> = {
    planning: '规划中',
    'in-progress': '进行中',
    delayed: '已延期',
    completed: '已完成',
  };
  return labels[status];
};

export const getRiskImpactLabel = (impact: RiskImpact): string => {
  const labels: Record<RiskImpact, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '严重',
  };
  return labels[impact];
};

export const getRiskProbabilityLabel = (probability: RiskProbability): string => {
  const labels: Record<RiskProbability, string> = {
    low: '低',
    medium: '中',
    high: '高',
  };
  return labels[probability];
};

export const getRiskStatusLabel = (status: RiskStatus): string => {
  const labels: Record<RiskStatus, string> = {
    open: '开放',
    mitigated: '已缓解',
    resolved: '已解决',
  };
  return labels[status];
};

export const getPendingItemTypeLabel = (type: PendingItemType): string => {
  const labels: Record<PendingItemType, string> = {
    decision: '决策',
    approval: '审批',
    feedback: '反馈',
  };
  return labels[type];
};

export const getFileIcon = (type: string): string => {
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf') || type.includes('word') || type.includes('doc') || type.includes('msword') || type.includes('text/')) return 'file-text';
  if (type.includes('excel') || type.includes('sheet') || type.includes('spreadsheet')) return 'sheet';
  if (type.includes('figma')) return 'palette';
  if (type.includes('zip') || type.includes('rar') || type.includes('archive') || type.includes('compressed')) return 'archive';
  return 'file';
};

export const getFileTypeCategory = (type: string): string => {
  if (type.startsWith('image/')) return 'image';
  if (type.includes('pdf') || type.includes('word') || type.includes('doc') || type.includes('msword') || type.includes('text/')) return 'document';
  if (type.includes('excel') || type.includes('sheet') || type.includes('spreadsheet')) return 'spreadsheet';
  if (type.includes('figma')) return 'design';
  if (type.includes('zip') || type.includes('rar') || type.includes('archive') || type.includes('compressed')) return 'archive';
  return 'other';
};

export const getActivityIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'status-change': 'refresh-cw',
    comment: 'message-square',
    'file-upload': 'upload',
    assignment: 'user-plus',
    milestone: 'flag',
  };
  return icons[type] || 'activity';
};

export const cn = (...args: (string | false | null | undefined)[]): string => {
  return args.filter(Boolean).join(' ');
};
