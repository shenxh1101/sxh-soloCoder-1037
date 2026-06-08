import { useState, useMemo } from 'react';
import { BarChart3, Clock, CheckCircle2, Circle, Activity, ChevronRight } from 'lucide-react';
import { useStore } from '../../store';
import { getRoleLabel, formatDateTime, cn } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Progress } from '../../components/ui/Progress';
import type { BadgeVariant } from '../../components/ui/Badge';

export default function Members() {
  const { users, currentProjectId, getMemberWorkload, getRequirementsByProject, getActivitiesByProject, getUserById } = useStore();
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const workload = getMemberWorkload(currentProjectId);
  const requirements = getRequirementsByProject(currentProjectId);
  const activities = getActivitiesByProject(currentProjectId);

  const maxTasks = useMemo(() => {
    return Math.max(...workload.map((w) => w.totalTasks), 1);
  }, [workload]);

  const getMemberTasks = (userId: string) => {
    return requirements.filter((r) => r.assigneeId === userId);
  };

  const getMemberActivities = (userId: string) => {
    return activities.filter((a) => a.userId === userId).slice(0, 10);
  };

  const roleColors: Record<string, BadgeVariant> = {
    product: 'primary',
    designer: 'success',
    developer: 'warning',
    admin: 'danger',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-slate-100">团队成员</h1>
        <Button variant="secondary" icon={BarChart3}>导出报告</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">成员负载概览</h2>
          <div className="space-y-4">
            {workload.map((w) => {
              const user = getUserById(w.userId);
              if (!user) return null;
              const todoPct = (w.todoTasks / maxTasks) * 100;
              const inProgressPct = (w.inProgressTasks / maxTasks) * 100;
              const donePct = (w.doneTasks / maxTasks) * 100;
              return (
                <div key={w.userId} className="flex items-center gap-4">
                  <div className="w-32 flex items-center gap-3">
                    <Avatar src={user.avatar} name={user.name} size="sm" />
                    <span className="text-slate-200 font-medium truncate">{user.name}</span>
                  </div>
                  <div className="flex-1 flex items-center gap-2 h-8">
                    {w.todoTasks > 0 && (
                      <div
                        className="h-full bg-slate-500/50 rounded-l-md transition-all duration-500"
                        style={{ width: `${todoPct}%` }}
                        title={`待开始: ${w.todoTasks}`}
                      />
                    )}
                    {w.inProgressTasks > 0 && (
                      <div
                        className="h-full bg-primary-500/70 transition-all duration-500"
                        style={{ width: `${inProgressPct}%` }}
                        title={`进行中: ${w.inProgressTasks}`}
                      />
                    )}
                    {w.doneTasks > 0 && (
                      <div
                        className="h-full bg-success-500/70 rounded-r-md transition-all duration-500"
                        style={{ width: `${donePct}%` }}
                        title={`已完成: ${w.doneTasks}`}
                      />
                    )}
                  </div>
                  <div className="w-24 text-right">
                    <span className="text-slate-300 font-medium">{w.totalTasks}</span>
                    <span className="text-slate-500 text-sm"> 个任务</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-500/50 rounded" />
              <span className="text-sm text-slate-400">待开始</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500/70 rounded" />
              <span className="text-sm text-slate-400">进行中</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-500/70 rounded" />
              <span className="text-sm text-slate-400">已完成</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold text-slate-100 mt-8">成员列表</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const userWorkload = workload.find((w) => w.userId === user.id);
          const userTasks = getMemberTasks(user.id);
          const progress = userWorkload && userWorkload.totalTasks > 0
            ? Math.round((userWorkload.doneTasks / userWorkload.totalTasks) * 100)
            : 0;
          return (
            <Card
              key={user.id}
              hover
              className={cn('cursor-pointer transition-all', selectedMember === user.id && 'ring-2 ring-primary-500')}
              onClick={() => setSelectedMember(selectedMember === user.id ? null : user.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar src={user.avatar} name={user.name} size="xl" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-100 text-lg">{user.name}</h3>
                      <ChevronRight className={cn('w-5 h-5 text-slate-500 transition-transform', selectedMember === user.id && 'rotate-90')} />
                    </div>
                    <Badge variant={roleColors[user.role]} className="mt-1">
                      {getRoleLabel(user.role)}
                    </Badge>
                    <div className="mt-4 space-y-2">
                      <Progress value={progress} showLabel size="sm" color={progress >= 80 ? 'success' : progress >= 50 ? 'primary' : 'warning'} />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-slate-400">
                          <Circle className="w-4 h-4" />
                          <span>{userWorkload?.todoTasks || 0} 待开始</span>
                        </div>
                        <div className="flex items-center gap-1 text-primary-400">
                          <Clock className="w-4 h-4" />
                          <span>{userWorkload?.inProgressTasks || 0} 进行中</span>
                        </div>
                        <div className="flex items-center gap-1 text-success-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{userWorkload?.doneTasks || 0} 已完成</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              {selectedMember === user.id && (
                <div className="border-t border-slate-800 p-5 animate-fade-in">
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      任务列表
                    </h4>
                    {userTasks.length === 0 ? (
                      <p className="text-slate-500 text-sm">暂无任务</p>
                    ) : (
                      <div className="space-y-2">
                        {userTasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between p-3 bg-dark-200/50 rounded-lg">
                            <span className="text-slate-300 text-sm truncate flex-1">{task.title}</span>
                            <Badge variant={task.status} className="ml-3 shrink-0">
                              {task.status === 'todo' ? '待开始' : task.status === 'in-progress' ? '进行中' : task.status === 'testing' ? '测试中' : task.status === 'done' ? '已完成' : '已取消'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-100 mb-3 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary-500" />
                      近期动态
                    </h4>
                    {getMemberActivities(user.id).length === 0 ? (
                      <p className="text-slate-500 text-sm">暂无动态</p>
                    ) : (
                      <div className="space-y-3">
                        {getMemberActivities(user.id).map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3">
                            <div className="w-2 h-2 mt-2 bg-primary-500 rounded-full shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm text-slate-300">{activity.description}</p>
                              <p className="text-xs text-slate-500 mt-1">{formatDateTime(activity.createdAt)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
