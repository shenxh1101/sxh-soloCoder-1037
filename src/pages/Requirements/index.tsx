import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, ChevronDown, ChevronUp, X, Send, Clock, User, Calendar, Tag, AlertTriangle, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Tag as TagComponent } from '../../components/ui/Tag';
import { Progress } from '../../components/ui/Progress';
import { useStore } from '../../store';
import { formatDate, formatDateTime, formatRelativeTime, getStatusLabel, getPriorityLabel } from '../../utils';
import type { Requirement } from '../../types';

export default function Requirements() {
  const s = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newReqTitle, setNewReqTitle] = useState('');
  const [commentText, setCommentText] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

  const requirements = useMemo(() => {
    let reqs = s.getRequirementsByProject(s.currentProjectId)
      .filter((r) => !s.myTasksFilter || r.assigneeId === s.currentUserId)
      .filter((r) => !s.assigneeFilter || r.assigneeId === s.assigneeFilter)
      .filter((r) => !s.priorityFilter || r.priority === s.priorityFilter);
    if (searchQuery) reqs = reqs.filter((r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return reqs;
  }, [s, searchQuery]);

  const comments = useMemo(() => (selectedReq ? s.getCommentsByRequirement(selectedReq.id) : []), [selectedReq, s]);
  const activities = useMemo(() => selectedReq ? s.getActivitiesByProject(s.currentProjectId).filter((a) => a.requirementId === selectedReq.id) : [], [selectedReq, s]);

  const handleCreate = () => {
    if (newReqTitle.trim()) {
      s.addRequirement({ projectId: s.currentProjectId, title: newReqTitle.trim(), description: '', status: 'todo', priority: 'medium', assigneeId: null, reporterId: s.currentUserId, estimatedHours: 0, spentHours: 0, dueDate: null, tags: [], milestoneId: null, blocked: false, blockReason: null });
      setNewReqTitle(''); setShowNewModal(false);
    }
  };

  const handleAddComment = () => {
    if (commentText.trim() && selectedReq) {
      s.addComment(selectedReq.id, commentText.trim());
      setCommentText('');
    }
  };

  const un = (id: string) => s.getUserById(id)?.name || '未知用户';
  const ua = (id: string) => s.getUserById(id)?.avatar || '';
  const gp = (r: Requirement) => r.estimatedHours > 0 ? (r.spentHours / r.estimatedHours) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-slate-100">需求列表</h1><p className="text-slate-400">管理和跟踪项目需求</p></div>
        <Button variant="primary" icon={Plus} onClick={() => setShowNewModal(true)}>新建需求</Button>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索需求..." className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <Button variant="secondary" icon={Filter} onClick={() => setShowFilters(!showFilters)}>筛选</Button>
            <Button variant={s.myTasksFilter ? 'primary' : 'secondary'} onClick={() => s.setMyTasksFilter(!s.myTasksFilter)}>我的任务</Button>
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-800">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">负责人</label>
                <select value={s.assigneeFilter || ''} onChange={(e) => s.setAssigneeFilter(e.target.value || null)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">全部</option>
                  {s.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">优先级</label>
                <select value={s.priorityFilter || ''} onChange={(e) => s.setPriorityFilter((e.target.value as any) || null)} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">全部</option><option value="low">低</option><option value="medium">中</option><option value="high">高</option><option value="urgent">紧急</option>
                </select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead><tr className="border-b border-slate-800 text-left">
              <th className="px-4 py-3 text-sm font-medium text-slate-400">需求名称</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">状态</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">优先级</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">负责人</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">截止日期</th>
              <th className="px-4 py-3 text-sm font-medium text-slate-400">进度</th>
            </tr></thead>
            <tbody>
              {requirements.map((req) => {
                const isExpanded = expandedRow === req.id;
                const p = gp(req);
                return (
                  <React.Fragment key={req.id}>
                    <tr className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => setSelectedReq(req)}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <button onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : req.id); }}>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>
                          <span className="font-medium text-slate-100">{req.title}</span>
                          {req.blocked && <AlertTriangle className="w-4 h-4 text-danger-500" />}
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant={req.status}>{getStatusLabel(req.status)}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={req.priority}>{getPriorityLabel(req.priority)}</Badge></td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar src={ua(req.assigneeId || '')} name={un(req.assigneeId || '')} size="sm" /><span className="text-slate-300">{un(req.assigneeId || '') || '未指派'}</span></div></td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(req.dueDate)}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-2"><Progress value={p} size="sm" className="w-20" /><span className="text-xs text-slate-500">{Math.round(p)}%</span></div></td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-800/30"><td colSpan={6} className="px-4 py-4">
                        <p className="text-slate-400 text-sm mb-3">{req.description}</p>
                        <div className="flex flex-wrap gap-2">{req.tags.map((tag) => <TagComponent key={tag}>{tag}</TagComponent>)}</div>
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {requirements.length === 0 && <p className="text-center text-slate-500 py-8">暂无匹配的需求</p>}
        </CardContent>
      </Card>

      {selectedReq && (
        <div className="fixed inset-y-0 right-0 w-96 bg-dark-100 border-l border-slate-800 shadow-xl flex flex-col z-50">
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="font-semibold text-slate-100 truncate pr-4">{selectedReq.title}</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedReq(null)}><X className="w-4 h-4" /></Button>
          </div>
          <div className="flex border-b border-slate-800">
            {(['details', 'comments', 'history'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-primary-400 border-b-2 border-primary-400' : 'text-slate-400 hover:text-slate-200'}`}>
                {tab === 'details' ? '详情' : tab === 'comments' ? `评论 (${comments.length})` : '历史'}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div><h4 className="text-sm font-medium text-slate-400 mb-2">描述</h4><p className="text-slate-200">{selectedReq.description}</p></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><h4 className="text-sm font-medium text-slate-400 mb-1">状态</h4><Badge variant={selectedReq.status}>{getStatusLabel(selectedReq.status)}</Badge></div>
                  <div><h4 className="text-sm font-medium text-slate-400 mb-1">优先级</h4><Badge variant={selectedReq.priority}>{getPriorityLabel(selectedReq.priority)}</Badge></div>
                </div>
                <div><h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><User className="w-4 h-4" /> 负责人</h4><div className="flex items-center gap-2"><Avatar src={ua(selectedReq.assigneeId || '')} name={un(selectedReq.assigneeId || '')} size="sm" /><span className="text-slate-200">{un(selectedReq.assigneeId || '') || '未指派'}</span></div></div>
                <div><h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> 截止日期</h4><p className="text-slate-200">{formatDate(selectedReq.dueDate)}</p></div>
                <div><h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> 工时进度</h4><Progress value={gp(selectedReq)} showLabel size="lg" /><p className="text-sm text-slate-500 mt-1">{selectedReq.spentHours} / {selectedReq.estimatedHours} 小时</p></div>
                <div><h4 className="text-sm font-medium text-slate-400 mb-2 flex items-center gap-2"><Tag className="w-4 h-4" /> 标签</h4><div className="flex flex-wrap gap-2">{selectedReq.tags.map((tag) => <TagComponent key={tag}>{tag}</TagComponent>)}</div></div>
                <div><h4 className="text-sm font-medium text-slate-400 mb-2">创建信息</h4><p className="text-sm text-slate-500">创建人: {un(selectedReq.reporterId)}</p><p className="text-sm text-slate-500">创建时间: {formatDateTime(selectedReq.createdAt)}</p><p className="text-sm text-slate-500">更新时间: {formatDateTime(selectedReq.updatedAt)}</p></div>
              </div>
            )}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {comments.length > 0 ? comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar src={ua(c.userId)} name={un(c.userId)} size="sm" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1"><span className="font-medium text-slate-100">{un(c.userId)}</span><span className="text-xs text-slate-500">{formatRelativeTime(c.createdAt)}</span></div>
                      <p className="text-sm text-slate-300">{c.content}</p>
                    </div>
                  </div>
                )) : <p className="text-center text-slate-500 py-8">暂无评论</p>}
              </div>
            )}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {activities.length > 0 ? activities.map((a, idx) => (
                  <div key={a.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center"><History className="w-4 h-4 text-slate-400" /></div>
                      {idx !== activities.length - 1 && <div className="w-px flex-1 bg-slate-700" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1"><span className="font-medium text-slate-100">{un(a.userId)}</span><span className="text-xs text-slate-500">{formatRelativeTime(a.createdAt)}</span></div>
                      <p className="text-sm text-slate-400">{a.description}</p>
                    </div>
                  </div>
                )) : <p className="text-center text-slate-500 py-8">暂无历史记录</p>}
              </div>
            )}
          </div>
          {activeTab === 'comments' && (
            <div className="p-4 border-t border-slate-800">
              <div className="flex gap-2">
                <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} placeholder="添加评论..." className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <Button onClick={handleAddComment} disabled={!commentText.trim()} icon={Send}>发送</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader><CardTitle>新建需求</CardTitle></CardHeader>
            <CardContent>
              <input type="text" value={newReqTitle} onChange={(e) => setNewReqTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreate()} placeholder="输入需求名称..." className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4" autoFocus />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowNewModal(false)}>取消</Button>
                <Button variant="primary" onClick={handleCreate} disabled={!newReqTitle.trim()}>创建</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
