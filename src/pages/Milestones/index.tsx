import { useState } from 'react';
import {
  Calendar,
  Target,
  AlertTriangle,
  Check,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  XCircle,
} from 'lucide-react';
import { useStore } from '../../store';
import {
  formatDate,
  formatRelativeTime,
  getMilestoneStatusLabel,
  getRiskImpactLabel,
  getRiskProbabilityLabel,
  getRiskStatusLabel,
  cn,
} from '../../utils';
import type {
  Milestone,
  Risk,
  Deliverable,
  DelayRecord,
  MilestoneStatus,
} from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Progress } from '../../components/ui/Progress';
import { Avatar } from '../../components/ui/Avatar';
import { Tag } from '../../components/ui/Tag';
import { Button } from '../../components/ui/Button';

const statusColorMap: Record<MilestoneStatus, string> = {
  planning: 'default',
  'in-progress': 'primary',
  delayed: 'warning',
  completed: 'success',
};

const riskImpactColorMap: Record<string, string> = {
  low: 'success',
  medium: 'primary',
  high: 'warning',
  critical: 'danger',
};

const riskStatusColorMap: Record<string, string> = {
  open: 'danger',
  mitigated: 'warning',
  resolved: 'success',
};

interface MilestoneCardProps {
  milestone: Milestone;
  risks: Risk[];
  deliverables: Deliverable[];
  delayRecords: DelayRecord[];
  isExpanded: boolean;
  onToggle: () => void;
}

function MilestoneCard({
  milestone,
  risks,
  deliverables,
  delayRecords,
  isExpanded,
  onToggle,
}: MilestoneCardProps) {
  const { getUserById, toggleDeliverable } = useStore();
  const completedDeliverables = deliverables.filter((d) => d.completed).length;
  const progressColor = milestone.status === 'delayed' ? 'warning' : milestone.status === 'completed' ? 'success' : 'primary';

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle>{milestone.name}</CardTitle>
              <Badge variant={statusColorMap[milestone.status] as any}>
                {getMilestoneStatusLabel(milestone.status)}
              </Badge>
              <Tag variant="default">v{milestone.version}</Tag>
            </div>
            <p className="text-sm text-slate-400 mb-3">{milestone.description}</p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>计划日期: {formatDate(milestone.targetDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>交付物: {completedDeliverables}/{deliverables.length}</span>
              </div>
              {risks.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning-500" />
                  <span>风险: {risks.length}</span>
                </div>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="!p-2">
            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
        <div className="mt-4">
          <Progress value={milestone.progress} color={progressColor} showLabel size="lg" />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {delayRecords.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning-500" />
                延期记录
              </h4>
              <div className="space-y-2">
                {delayRecords.map((record) => {
                  const approver = record.approvedBy ? getUserById(record.approvedBy) : undefined;
                  return (
                    <div key={record.id} className="bg-dark-200 rounded-lg p-3 border border-warning-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-warning-500" />
                          <span className="text-sm font-medium text-warning-500">延期 {record.delayDays} 天</span>
                        </div>
                        <span className="text-xs text-slate-500">{formatRelativeTime(record.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">{record.reason}</p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>新目标日期: {formatDate(record.newTargetDate)}</span>
                        {approver && <span>审批人: {approver.name}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {risks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning-500" />
                风险项
              </h4>
              <div className="space-y-3">
                {risks.map((risk) => {
                  const owner = getUserById(risk.ownerId);
                  return (
                    <div key={risk.id} className="bg-dark-200 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-slate-200 flex-1">{risk.description}</p>
                        <div className="flex items-center gap-2 ml-3">
                          <Badge variant={riskImpactColorMap[risk.impact] as any}>
                            影响: {getRiskImpactLabel(risk.impact)}
                          </Badge>
                          <Badge variant={riskStatusColorMap[risk.status] as any}>
                            {getRiskStatusLabel(risk.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                        <span>发生概率: {getRiskProbabilityLabel(risk.probability)}</span>
                        {owner && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>责任人: {owner.name}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        <span className="text-slate-400">应对措施: </span>
                        {risk.mitigation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-success-500" />
              交付清单 ({completedDeliverables}/{deliverables.length})
            </h4>
            <div className="space-y-2">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  onClick={() => toggleDeliverable(deliverable.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                    deliverable.completed
                      ? 'bg-success-500/10 border-success-500/30'
                      : 'bg-dark-200 border-slate-700 hover:border-primary-500/50'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all',
                      deliverable.completed
                        ? 'bg-success-500 border-success-500'
                        : 'border-slate-600'
                    )}
                  >
                    {deliverable.completed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'text-sm font-medium',
                      deliverable.completed ? 'text-slate-500 line-through' : 'text-slate-200'
                    )}>
                      {deliverable.name}
                    </p>
                    <p className="text-xs text-slate-500">{deliverable.description}</p>
                  </div>
                  {deliverable.completedAt && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(deliverable.completedAt)}</span>
                    </div>
                  )}
                  {deliverable.attachmentUrl && (
                    <div className="text-xs text-primary-400">附件</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default function Milestones() {
  const {
    getMilestonesByProject,
    getRisksByMilestone,
    getDeliverablesByMilestone,
    getDelayRecordsByMilestone,
    currentProjectId,
  } = useStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const milestones = getMilestonesByProject(currentProjectId);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-slate-100">里程碑管理</h1>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>共 {milestones.length} 个里程碑</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            risks={getRisksByMilestone(milestone.id)}
            deliverables={getDeliverablesByMilestone(milestone.id)}
            delayRecords={getDelayRecordsByMilestone(milestone.id)}
            isExpanded={expandedId === milestone.id}
            onToggle={() => setExpandedId(expandedId === milestone.id ? null : milestone.id)}
          />
        ))}

        {milestones.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500">暂无里程碑</p>
          </div>
        )}
      </div>
    </div>
  );
}
