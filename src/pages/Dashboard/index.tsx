import React from 'react';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  TrendingUp,
  ChevronRight,
  AlertCircle,
  Check,
  Activity,
  FileText,
  UserPlus,
  Flag,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useStore } from '../../store';
import {
  formatRelativeTime,
  getPriorityLabel,
  getRoleLabel,
  getPendingItemTypeLabel,
} from '../../utils';
import type { Activity as ActivityType, MemberWorkload, PendingItem, Requirement } from '../../types';

const activityIcons: Record<string, React.FC<{ className?: string }>> = {
  'status-change': RefreshCw,
  comment: MessageSquare,
  'file-upload': Upload,
  assignment: UserPlus,
  milestone: Flag,
};

const CircularProgress: React.FC<{ value: number; size?: number }> = ({ value, size = 120 }) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#3b82f6" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-slate-100">{value}%</span>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.FC<{ className?: string }>; title: string; value: number; color: string }> = ({
  icon: Icon, title, value, color,
}) => (
  <Card hover className="p-4">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
      </div>
    </div>
  </Card>
);

const BlockedTaskItem: React.FC<{ req: Requirement; userName: string; userAvatar: string }> = ({
  req, userName, userAvatar,
}) => (
  <div className="flex items-start gap-3 p-3 rounded-lg bg-danger-500/10 border border-danger-500/30 hover:bg-danger-500/20 transition-colors">
    <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium text-slate-100 truncate">{req.title}</span>
        <Badge variant={req.priority}>{getPriorityLabel(req.priority)}</Badge>
      </div>
      <p className="text-sm text-slate-400 mb-2">{req.blockReason}</p>
      <div className="flex items-center gap-2">
        <Avatar src={userAvatar} name={userName} size="sm" />
        <span className="text-sm text-slate-400">{userName}</span>
      </div>
    </div>
  </div>
);

const TimelineItem: React.FC<{ activity: ActivityType; userName: string; userAvatar: string; isLast: boolean }> = ({
  activity, userName, userAvatar, isLast,
}) => {
  const Icon = activityIcons[activity.type] || Activity;
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-primary-600/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary-400" />
        </div>
        {!isLast && <div className="w-px flex-1 bg-slate-700 mt-1" />}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <Avatar src={userAvatar} name={userName} size="sm" />
          <span className="font-medium text-slate-100">{userName}</span>
          <span className="text-xs text-slate-500">{formatRelativeTime(activity.createdAt)}</span>
        </div>
        <p className="text-sm text-slate-400">{activity.description}</p>
      </div>
    </div>
  );
};

const WorkloadBar: React.FC<{ workload: MemberWorkload; userName: string; userRole: string }> = ({
  workload, userName, userRole,
}) => {
  const total = workload.todoTasks + workload.inProgressTasks + workload.doneTasks;
  const todoWidth = total > 0 ? (workload.todoTasks / total) * 100 : 0;
  const inProgressWidth = total > 0 ? (workload.inProgressTasks / total) * 100 : 0;
  const doneWidth = total > 0 ? (workload.doneTasks / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-100">{userName}</span>
          <span className="text-xs text-slate-500">{getRoleLabel(userRole as any)}</span>
        </div>
        <span className="text-sm text-slate-400">{workload.spentHours}/{workload.estimatedHours}h</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-slate-800">
        <div className="bg-slate-500 transition-all" style={{ width: `${todoWidth}%` }} />
        <div className="bg-primary-500 transition-all" style={{ width: `${inProgressWidth}%` }} />
        <div className="bg-success-500 transition-all" style={{ width: `${doneWidth}%` }} />
      </div>
      <div className="flex gap-3 text-xs">
        <span className="text-slate-500">待开始 {workload.todoTasks}</span>
        <span className="text-primary-400">进行中 {workload.inProgressTasks}</span>
        <span className="text-success-400">已完成 {workload.doneTasks}</span>
      </div>
    </div>
  );
};

const PendingItemCard: React.FC<{ item: PendingItem; onConfirm: () => void }> = ({ item, onConfirm }) => (
  <Card hover className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="warning">{getPendingItemTypeLabel(item.type)}</Badge>
          {item.dueDate && <span className="text-xs text-slate-500">截止 {formatRelativeTime(item.dueDate)}</span>}
        </div>
        <h4 className="font-medium text-slate-100 mb-1">{item.title}</h4>
        <p className="text-sm text-slate-400 line-clamp-2">{item.description}</p>
      </div>
      <Button size="sm" variant="primary" icon={Check} onClick={onConfirm}>确认</Button>
    </div>
  </Card>
);

export default function Dashboard() {
  const {
    currentProjectId, getProjectProgress, getRequirementsByProject, getBlockedRequirements,
    getActivitiesByProject, getMemberWorkload, getPendingItemsByProject, getUserById, confirmPendingItem,
  } = useStore();

  const progress = getProjectProgress(currentProjectId);
  const requirements = getRequirementsByProject(currentProjectId);
  const blockedReqs = getBlockedRequirements(currentProjectId);
  const activities = getActivitiesByProject(currentProjectId).slice(0, 5);
  const workloads = getMemberWorkload(currentProjectId).filter((w) => w.totalTasks > 0);
  const pendingItems = getPendingItemsByProject(currentProjectId);

  const stats = [
    { icon: LayoutDashboard, title: '总需求数', value: requirements.length, color: 'bg-primary-600/20 text-primary-400' },
    { icon: CheckCircle2, title: '已完成', value: requirements.filter((r) => r.status === 'done').length, color: 'bg-success-600/20 text-success-400' },
    { icon: Clock, title: '进行中', value: requirements.filter((r) => r.status === 'in-progress' || r.status === 'testing').length, color: 'bg-warning-600/20 text-warning-400' },
    { icon: AlertTriangle, title: '待开始', value: requirements.filter((r) => r.status === 'todo').length, color: 'bg-slate-600/20 text-slate-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">项目概览</h1>
          <p className="text-slate-400">查看项目进度和关键指标</p>
        </div>
        <Button variant="primary" icon={TrendingUp}>查看报告</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <CardHeader className="p-0 pb-4"><CardTitle>项目进度</CardTitle></CardHeader>
          <CardContent className="p-0 flex flex-col items-center">
            <CircularProgress value={progress} />
            <p className="mt-4 text-slate-400">总体完成度</p>
          </CardContent>
        </Card>
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {stats.map((stat, idx) => <StatCard key={idx} {...stat} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger-500" />
              阻塞任务
              {blockedReqs.length > 0 && <Badge variant="danger">{blockedReqs.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {blockedReqs.length > 0 ? blockedReqs.map((req) => {
              const user = getUserById(req.assigneeId || '');
              return (
                <BlockedTaskItem
                  key={req.id} req={req} userName={user?.name || '未指派'} userAvatar={user?.avatar || ''}
                />
              );
            }) : <p className="text-center text-slate-500 py-4">暂无阻塞任务</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-400" />
              近期动态
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.map((activity, idx) => {
              const user = getUserById(activity.userId);
              return (
                <TimelineItem
                  key={activity.id} activity={activity} userName={user?.name || '未知用户'}
                  userAvatar={user?.avatar || ''} isLast={idx === activities.length - 1}
                />
              );
            })}
            <Button variant="ghost" className="w-full mt-2" icon={ChevronRight}>查看全部动态</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary-400" />
              成员负载
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {workloads.map((workload) => {
              const user = getUserById(workload.userId);
              return (
                <WorkloadBar
                  key={workload.userId} workload={workload} userName={user?.name || '未知用户'}
                  userRole={user?.role || ''}
                />
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-warning-400" />
              待确认事项
              {pendingItems.length > 0 && <Badge variant="warning">{pendingItems.length}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingItems.length > 0 ? pendingItems.map((item) => (
              <PendingItemCard key={item.id} item={item} onConfirm={() => confirmPendingItem(item.id)} />
            )) : <p className="text-center text-slate-500 py-4">暂无待确认事项</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
