import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  MessageSquare,
  Filter,
  User,
  AlertTriangle,
  FileText,
  Clock,
  RefreshCw,
  Upload,
  UserPlus,
  Flag,
  Send,
  Link2,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Pencil,
  Unlink,
  Check,
  X,
} from 'lucide-react';
import { useStore } from '../../store';
import { kanbanColumns } from '../../data/mockData';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatFileSize,
  getPriorityLabel,
  getStatusLabel,
  cn,
} from '../../utils';
import type { Requirement, RequirementStatus, Priority, Activity, ProjectFile } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Input } from '../../components/ui/Input';

const activityIconMap: Record<string, typeof RefreshCw> = {
  'status-change': RefreshCw,
  'comment': MessageSquare,
  'file-upload': Upload,
  'assignment': UserPlus,
  'milestone': Flag,
};

interface SortableCardProps {
  task: Requirement;
  onClick: () => void;
}

function SortableTaskCard({ task, onClick }: SortableCardProps) {
  const { getUserById, getCommentsByRequirement } = useStore();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const assignee = task.assigneeId ? getUserById(task.assigneeId) : undefined;
  const commentCount = getCommentsByRequirement(task.id).length;
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => { if (!isDragging) { e.stopPropagation(); onClick(); } }}
      className={cn(
        'bg-dark-200 border border-slate-700 rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all',
        task.blocked && 'border-danger-500/50'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-100 line-clamp-2 flex-1">{task.title}</h4>
        {task.blocked && <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />}
      </div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant={task.priority}>{getPriorityLabel(task.priority)}</Badge>
        {task.tags.slice(0, 1).map((tag) => <Tag key={tag} variant="default">{tag}</Tag>)}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {assignee ? (
            <Avatar src={assignee.avatar} name={assignee.name} size="sm" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
          )}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{commentCount}</span>
          </div>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Kanban() {
  const {
    users, getRequirementsByStatus, getCommentsByRequirement, getFilesByProject, getFilesByRequirement,
    getActivitiesByProject, getUserById, updateRequirementStatus, updateRequirement, addComment,
    linkFileToRequirement, unlinkFileFromRequirement, currentProjectId, myTasksFilter, assigneeFilter,
    priorityFilter, setMyTasksFilter, setAssigneeFilter, setPriorityFilter,
  } = useStore();

  const [activeTask, setActiveTask] = useState<Requirement | null>(null);
  const [selectedTask, setSelectedTask] = useState<Requirement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string | number>('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleDragStart = (event: DragStartEvent) => {
    const allTasks = kanbanColumns.flatMap((col) => getRequirementsByStatus(col.id));
    const task = allTasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;
    const overId = over.id as string;
    const column = kanbanColumns.find((col) => col.id === overId);
    if (column) {
      updateRequirementStatus(active.id as string, column.id);
      return;
    }
    const allTasks = kanbanColumns.flatMap((col) =>
      getRequirementsByStatus(col.id).map((t) => ({ ...t, columnId: col.id }))
    );
    const targetTask = allTasks.find((t) => t.id === overId);
    if (targetTask) {
      updateRequirementStatus(active.id as string, targetTask.columnId as RequirementStatus);
    }
  };

  const priorities: Priority[] = ['low', 'medium', 'high', 'urgent'];
  const taskComments = selectedTask ? getCommentsByRequirement(selectedTask.id) : [];
  const taskActivities = selectedTask
    ? getActivitiesByProject(currentProjectId).filter((a) => a.requirementId === selectedTask.id)
    : [];
  const taskFiles = selectedTask ? getFilesByRequirement(selectedTask.id) : [];
  const availableFiles = useMemo(() => {
    if (!selectedTask) return [];
    const projectFiles = getFilesByProject(currentProjectId);
    return projectFiles.filter((f) => !f.requirementId);
  }, [selectedTask, currentProjectId, getFilesByProject]);

  const handleAddComment = () => {
    if (commentText.trim() && selectedTask) {
      addComment(selectedTask.id, commentText.trim());
      setCommentText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleLinkFile = (fileId: string) => {
    if (selectedTask) {
      linkFileToRequirement(fileId, selectedTask.id);
    }
  };

  const handleUnlinkFile = (fileId: string) => {
    unlinkFileFromRequirement(fileId);
  };

  const startEditing = (field: string, value: string | number) => {
    setEditingField(field);
    setEditValue(value);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
  };

  const saveEditing = (field: string) => {
    if (!selectedTask) return;
    
    let updates: Partial<Requirement> = {};
    switch (field) {
      case 'assigneeId':
        updates = { assigneeId: editValue as string || null };
        break;
      case 'priority':
        updates = { priority: editValue as Priority };
        break;
      case 'dueDate':
        updates = { dueDate: editValue as string || null };
        break;
      case 'estimatedHours':
        updates = { estimatedHours: Number(editValue) || 0 };
        break;
      case 'status':
        updates = { status: editValue as RequirementStatus };
        break;
      default:
        return;
    }
    
    updateRequirement(selectedTask.id, updates);
    setEditingField(null);
    setEditValue('');
  };

  const handleStatusChange = (status: RequirementStatus) => {
    if (!selectedTask) return;
    updateRequirementStatus(selectedTask.id, status);
  };

  const selectStyle = "w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors";
  const textareaStyle = "w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none min-h-[80px]";

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="text-2xl font-bold font-display text-slate-100">任务看板</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <Button
              variant={myTasksFilter ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setMyTasksFilter(!myTasksFilter)}
            >
              我的任务
            </Button>
          </div>
          <select
            value={assigneeFilter || ''}
            onChange={(e) => setAssigneeFilter(e.target.value || null)}
            className="bg-dark-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部负责人</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select
            value={priorityFilter || ''}
            onChange={(e) => setPriorityFilter((e.target.value as Priority) || null)}
            className="bg-dark-100 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">全部优先级</option>
            {priorities.map((p) => <option key={p} value={p}>{getPriorityLabel(p)}</option>)}
          </select>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((column) => {
            const tasks = getRequirementsByStatus(column.id);
            return (
              <div key={column.id} className="flex-shrink-0 w-72 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
                    <h3 className="font-semibold text-slate-200">{column.title}</h3>
                    <Badge variant="default">{tasks.length}</Badge>
                  </div>
                </div>
                <div className="flex-1 bg-dark-200/50 rounded-lg p-2 border border-slate-800 overflow-y-auto">
                  <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          onClick={() => { setSelectedTask(task); setShowModal(true); }}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="bg-dark-200 border border-primary-500 rounded-lg p-3 shadow-2xl shadow-primary-500/20 opacity-90">
              <h4 className="text-sm font-medium text-slate-100">{activeTask.title}</h4>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setShowFileSelector(false);
          setCommentText('');
        }}
        title={selectedTask?.title}
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
      >
        {selectedTask && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleStatusChange(e.target.value as RequirementStatus)}
                  className={cn(selectStyle, "!py-1 !text-xs !w-auto")}
                >
                  {kanbanColumns.map((col) => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                {editingField === 'priority' ? (
                  <div className="flex items-center gap-1">
                    <select
                      value={editValue as string}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={cn(selectStyle, "!py-1 !text-xs !w-auto")}
                      autoFocus
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                    <button
                      onClick={() => saveEditing('priority')}
                      className="p-1 rounded hover:bg-dark-100 text-success-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1 rounded hover:bg-dark-100 text-danger-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 group">
                    <Badge variant={selectedTask.priority}>{getPriorityLabel(selectedTask.priority)}</Badge>
                    <button
                      onClick={() => startEditing('priority', selectedTask.priority)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-100 text-slate-400 transition-opacity"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              {selectedTask.tags.map((tag) => <Tag key={tag} variant="default">{tag}</Tag>)}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">任务描述</h4>
              <p className="text-slate-400 text-sm">{selectedTask.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">负责人</h4>
                {editingField === 'assigneeId' ? (
                  <div className="flex items-center gap-2">
                    <select
                      value={editValue as string}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={selectStyle}
                      autoFocus
                    >
                      <option value="">未分配</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => saveEditing('assigneeId')}
                      className="p-1.5 rounded hover:bg-dark-100 text-success-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 rounded hover:bg-dark-100 text-danger-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    {selectedTask.assigneeId ? (
                      <div className="flex items-center gap-2">
                        <Avatar src={getUserById(selectedTask.assigneeId)?.avatar} name={getUserById(selectedTask.assigneeId)?.name} size="sm" />
                        <span className="text-slate-400 text-sm">{getUserById(selectedTask.assigneeId)?.name}</span>
                      </div>
                    ) : <span className="text-slate-500 text-sm">未分配</span>}
                    <button
                      onClick={() => startEditing('assigneeId', selectedTask.assigneeId || '')}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-100 text-slate-400 transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">截止日期</h4>
                {editingField === 'dueDate' ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={editValue as string}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="!py-1.5"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEditing('dueDate')}
                      className="p-1.5 rounded hover:bg-dark-100 text-success-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 rounded hover:bg-dark-100 text-danger-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className="text-slate-400 text-sm">{formatDate(selectedTask.dueDate)}</span>
                    <button
                      onClick={() => startEditing('dueDate', selectedTask.dueDate || '')}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-100 text-slate-400 transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">预计工时</h4>
                {editingField === 'estimatedHours' ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={editValue as number}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="!py-1.5"
                      min="0"
                      autoFocus
                    />
                    <span className="text-slate-400 text-sm">小时</span>
                    <button
                      onClick={() => saveEditing('estimatedHours')}
                      className="p-1.5 rounded hover:bg-dark-100 text-success-500"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 rounded hover:bg-dark-100 text-danger-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <span className="text-slate-400 text-sm">{selectedTask.estimatedHours} 小时</span>
                    <button
                      onClick={() => startEditing('estimatedHours', selectedTask.estimatedHours)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-dark-100 text-slate-400 transition-opacity"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-2">已用工时</h4>
                <span className="text-slate-400 text-sm">{selectedTask.spentHours} 小时</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  关联文件 ({taskFiles.length})
                </h4>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowFileSelector(!showFileSelector)}
                  className="gap-1.5"
                >
                  <Link2 className="w-4 h-4" />
                  {showFileSelector ? '收起' : '关联文件'}
                  {showFileSelector ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              {showFileSelector && (
                <div className="mb-4 p-3 bg-dark-200/50 rounded-lg border border-slate-700">
                  <h5 className="text-xs font-medium text-slate-400 mb-2">可关联的文件</h5>
                  {availableFiles.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-dark-100 cursor-pointer transition-colors"
                          onClick={() => handleLinkFile(file.id)}
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-200 truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                          </div>
                          <Link2 className="w-4 h-4 text-primary-400" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 py-2 text-center">暂无可关联的文件</p>
                  )}
                </div>
              )}

              {taskFiles.length > 0 ? (
                <div className="space-y-2">
                  {taskFiles.map((file: ProjectFile) => (
                    <Card key={file.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-200 truncate">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {formatFileSize(file.size)} · {formatDateTime(file.uploadedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnlinkFile(file.id)}
                          className="!p-1.5 text-slate-400 hover:text-danger-500 hover:bg-danger-500/10"
                          title="取消关联"
                        >
                          <Unlink className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-2">暂无关联文件</p>
              )}
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                评论 ({taskComments.length})
              </h4>
              {taskComments.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {taskComments.map((comment) => {
                    const user = getUserById(comment.userId);
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar src={user?.avatar} name={user?.name} size="sm" />
                        <div className="flex-1 bg-dark-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-slate-200">{user?.name}</span>
                            <span className="text-xs text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                          <p className="text-sm text-slate-400">{comment.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-4 mb-4 text-center">暂无评论</p>
              )}
              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="添加评论...（按 Enter 发送，Shift+Enter 换行）"
                  className={textareaStyle}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  icon={Send}
                  className="self-end"
                >
                  发送
                </Button>
              </div>
            </div>

            {taskActivities.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-300 mb-3">变更记录</h4>
                <div className="space-y-3">
                  {taskActivities.map((activity: Activity) => {
                    const user = getUserById(activity.userId);
                    const Icon = activityIconMap[activity.type] || Clock;
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dark-200 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-slate-300">{activity.description}</p>
                          <p className="text-xs text-slate-500 mt-1">{user?.name} · {formatRelativeTime(activity.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
