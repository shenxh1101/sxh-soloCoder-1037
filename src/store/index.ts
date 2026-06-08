import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  Project,
  Requirement,
  Comment,
  Activity,
  Milestone,
  Risk,
  Deliverable,
  DelayRecord,
  ProjectFile,
  PendingItem,
  RequirementStatus,
  Priority,
  MemberWorkload,
  FileVersion,
  SearchResults,
  SearchResult,
} from '../types';
import {
  mockUsers,
  mockProjects,
  mockRequirements,
  mockComments,
  mockActivities,
  mockMilestones,
  mockRisks,
  mockDeliverables,
  mockDelayRecords,
  mockFiles,
  mockPendingItems,
  currentUserId,
} from '../data/mockData';

interface AppState {
  users: User[];
  projects: Project[];
  requirements: Requirement[];
  comments: Comment[];
  activities: Activity[];
  milestones: Milestone[];
  risks: Risk[];
  deliverables: Deliverable[];
  delayRecords: DelayRecord[];
  files: ProjectFile[];
  pendingItems: PendingItem[];
  currentProjectId: string;
  currentUserId: string;

  getCurrentProject: () => Project | undefined;
  getCurrentUser: () => User | undefined;
  getUserById: (id: string) => User | undefined;
  getRequirementsByProject: (projectId: string) => Requirement[];
  getRequirementsByStatus: (status: RequirementStatus) => Requirement[];
  getCommentsByRequirement: (requirementId: string) => Comment[];
  getActivitiesByProject: (projectId: string) => Activity[];
  getMilestonesByProject: (projectId: string) => Milestone[];
  getRisksByMilestone: (milestoneId: string) => Risk[];
  getDeliverablesByMilestone: (milestoneId: string) => Deliverable[];
  getDelayRecordsByMilestone: (milestoneId: string) => DelayRecord[];
  getFilesByProject: (projectId: string) => ProjectFile[];
  getFilesByRequirement: (requirementId: string) => ProjectFile[];
  getFileById: (fileId: string) => ProjectFile | undefined;
  getPendingItemsByProject: (projectId: string) => PendingItem[];
  getBlockedRequirements: (projectId: string) => Requirement[];
  getMemberWorkload: (projectId: string) => MemberWorkload[];
  getProjectProgress: (projectId: string) => number;
  search: (projectId: string, query: string) => SearchResults;
  getActivitiesByProjectFiltered: (projectId: string, filters?: { userId?: string; type?: string; dateFrom?: string; dateTo?: string }) => Activity[];

  setCurrentProject: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  updateRequirementStatus: (id: string, status: RequirementStatus) => void;
  deleteRequirement: (id: string) => void;
  addComment: (requirementId: string, content: string) => void;
  addRequirement: (req: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) => string;
  addFile: (file: Omit<ProjectFile, 'id' | 'uploadedAt' | 'currentVersion' | 'versions'>, changeLog?: string) => string;
  uploadNewVersion: (fileId: string, versionData: Omit<FileVersion, 'id' | 'fileId' | 'version' | 'uploadedAt'>, changeLog: string) => void;
  setFileVersion: (fileId: string, version: number) => void;
  linkFileToRequirement: (fileId: string, requirementId: string) => void;
  unlinkFileFromRequirement: (fileId: string) => void;
  confirmPendingItem: (id: string) => void;
  toggleDeliverable: (id: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;

  myTasksFilter: boolean;
  assigneeFilter: string | null;
  priorityFilter: Priority | null;
  setMyTasksFilter: (value: boolean) => void;
  setAssigneeFilter: (value: string | null) => void;
  setPriorityFilter: (value: Priority | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      users: mockUsers,
      projects: mockProjects,
      requirements: mockRequirements,
      comments: mockComments,
      activities: mockActivities,
      milestones: mockMilestones,
      risks: mockRisks,
      deliverables: mockDeliverables,
      delayRecords: mockDelayRecords,
      files: mockFiles,
      pendingItems: mockPendingItems,
      currentProjectId: 'p1',
      currentUserId: currentUserId,

      myTasksFilter: false,
      assigneeFilter: null,
      priorityFilter: null,

      setMyTasksFilter: (value) => set({ myTasksFilter: value }),
      setAssigneeFilter: (value) => set({ assigneeFilter: value }),
      setPriorityFilter: (value) => set({ priorityFilter: value }),

      getCurrentProject: () => {
        const { projects, currentProjectId } = get();
        return projects.find((p) => p.id === currentProjectId);
      },

      getCurrentUser: () => {
        const { users, currentUserId } = get();
        return users.find((u) => u.id === currentUserId);
      },

      getUserById: (id) => {
        return get().users.find((u) => u.id === id);
      },

      getRequirementsByProject: (projectId) => {
        return get().requirements.filter((r) => r.projectId === projectId);
      },

      getRequirementsByStatus: (status) => {
        const { currentProjectId, myTasksFilter, assigneeFilter, priorityFilter, currentUserId } = get();
        let reqs = get().requirements.filter(
          (r) => r.projectId === currentProjectId && r.status === status
        );
        
        if (myTasksFilter) {
          reqs = reqs.filter((r) => r.assigneeId === currentUserId);
        }
        if (assigneeFilter) {
          reqs = reqs.filter((r) => r.assigneeId === assigneeFilter);
        }
        if (priorityFilter) {
          reqs = reqs.filter((r) => r.priority === priorityFilter);
        }
        
        return reqs;
      },

      getCommentsByRequirement: (requirementId) => {
        return get().comments.filter((c) => c.requirementId === requirementId);
      },

      getActivitiesByProject: (projectId) => {
        return get()
          .activities.filter((a) => a.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getMilestonesByProject: (projectId) => {
        return get()
          .milestones.filter((m) => m.projectId === projectId)
          .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime());
      },

      getRisksByMilestone: (milestoneId) => {
        return get().risks.filter((r) => r.milestoneId === milestoneId);
      },

      getDeliverablesByMilestone: (milestoneId) => {
        return get().deliverables.filter((d) => d.milestoneId === milestoneId);
      },

      getDelayRecordsByMilestone: (milestoneId) => {
        return get()
          .delayRecords.filter((d) => d.milestoneId === milestoneId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },

      getFilesByProject: (projectId) => {
        return get()
          .files.filter((f) => f.projectId === projectId)
          .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      },

      getFilesByRequirement: (requirementId) => {
        return get().files.filter((f) => f.requirementId === requirementId);
      },

      getFileById: (fileId) => {
        return get().files.find((f) => f.id === fileId);
      },

      search: (projectId, query) => {
        const { requirements, comments, files, milestones, users, getUserById } = get();
        const lowerQuery = query.toLowerCase();
        const results: SearchResults = {
          requirements: [],
          comments: [],
          files: [],
          milestones: [],
          members: [],
        };

        requirements
          .filter((r) => r.projectId === projectId)
          .forEach((r) => {
            if (
              r.title.toLowerCase().includes(lowerQuery) ||
              r.description.toLowerCase().includes(lowerQuery) ||
              r.tags.some((t) => t.toLowerCase().includes(lowerQuery))
            ) {
              const highlight = r.description.length > 100 ? r.description.substring(0, 100) + '...' : r.description;
              results.requirements.push({
                type: 'requirement',
                id: r.id,
                title: r.title,
                description: highlight,
                url: `/projects/${projectId}/requirements?highlight=${r.id}`,
              });
            }
          });

        comments
          .filter((c) => {
            const req = requirements.find((r) => r.id === c.requirementId);
            return req && req.projectId === projectId;
          })
          .forEach((c) => {
            if (c.content.toLowerCase().includes(lowerQuery)) {
              const user = getUserById(c.userId);
              const req = requirements.find((r) => r.id === c.requirementId);
              results.comments.push({
                type: 'comment',
                id: c.id,
                title: `${user?.name || '未知用户'} 的评论`,
                description: c.content.length > 100 ? c.content.substring(0, 100) + '...' : c.content,
                highlight: c.content,
                url: `/projects/${projectId}/requirements?highlight=${c.requirementId}&tab=comments`,
              });
            }
          });

        files
          .filter((f) => f.projectId === projectId)
          .forEach((f) => {
            if (
              f.name.toLowerCase().includes(lowerQuery) ||
              f.tags.some((t) => t.toLowerCase().includes(lowerQuery))
            ) {
              results.files.push({
                type: 'file',
                id: f.id,
                title: f.name,
                description: f.tags.join(', '),
                url: `/projects/${projectId}/files?highlight=${f.id}`,
              });
            }
          });

        milestones
          .filter((m) => m.projectId === projectId)
          .forEach((m) => {
            if (
              m.name.toLowerCase().includes(lowerQuery) ||
              m.description.toLowerCase().includes(lowerQuery) ||
              m.version.toLowerCase().includes(lowerQuery)
            ) {
              results.milestones.push({
                type: 'milestone',
                id: m.id,
                title: m.name,
                description: m.description,
                url: `/projects/${projectId}/milestones?highlight=${m.id}`,
              });
            }
          });

        users.forEach((u) => {
          if (
            u.name.toLowerCase().includes(lowerQuery) ||
            u.email.toLowerCase().includes(lowerQuery)
          ) {
            results.members.push({
              type: 'member',
              id: u.id,
              title: u.name,
              description: u.email,
              url: `/projects/${projectId}/members?highlight=${u.id}`,
            });
          }
        });

        return results;
      },

      getActivitiesByProjectFiltered: (projectId, filters = {}) => {
        let activities = get()
          .activities.filter((a) => a.projectId === projectId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        if (filters.userId) {
          activities = activities.filter((a) => a.userId === filters.userId);
        }
        if (filters.type) {
          activities = activities.filter((a) => a.type === filters.type);
        }
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          activities = activities.filter((a) => new Date(a.createdAt) >= fromDate);
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          activities = activities.filter((a) => new Date(a.createdAt) <= toDate);
        }

        return activities;
      },

      getPendingItemsByProject: (projectId) => {
        return get().pendingItems.filter((p) => p.projectId === projectId);
      },

      getBlockedRequirements: (projectId) => {
        return get().requirements.filter(
          (r) => r.projectId === projectId && r.blocked
        );
      },

      getMemberWorkload: (projectId) => {
        const { users, requirements } = get();
        return users.map((user) => {
          const userReqs = requirements.filter(
            (r) => r.projectId === projectId && r.assigneeId === user.id
          );
          return {
            userId: user.id,
            totalTasks: userReqs.length,
            todoTasks: userReqs.filter((r) => r.status === 'todo').length,
            inProgressTasks: userReqs.filter((r) => r.status === 'in-progress').length,
            doneTasks: userReqs.filter((r) => r.status === 'done').length,
            estimatedHours: userReqs.reduce((sum, r) => sum + r.estimatedHours, 0),
            spentHours: userReqs.reduce((sum, r) => sum + r.spentHours, 0),
          };
        });
      },

      getProjectProgress: (projectId) => {
        const { requirements } = get();
        const projectReqs = requirements.filter((r) => r.projectId === projectId);
        if (projectReqs.length === 0) return 0;
        const doneReqs = projectReqs.filter((r) => r.status === 'done');
        return Math.round((doneReqs.length / projectReqs.length) * 100);
      },

      setCurrentProject: (projectId) => set({ currentProjectId: projectId }),

      addProject: (project) => {
        const newId = `p${Date.now()}`;
        const newProject: Project = {
          ...project,
          id: newId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        return newId;
      },

      updateRequirementStatus: (id, status) => {
        const { requirements, currentUserId, addActivity } = get();
        const req = requirements.find((r) => r.id === id);
        if (!req) return;

        const oldStatus = req.status;
        
        set({
          requirements: requirements.map((r) =>
            r.id === id
              ? { ...r, status, updatedAt: new Date().toISOString() }
              : r
          ),
        });

        const statusLabels: Record<RequirementStatus, string> = {
          'todo': '待开始',
          'in-progress': '进行中',
          'testing': '测试中',
          'done': '已完成',
          'cancelled': '已取消',
        };

        addActivity({
          projectId: req.projectId,
          type: 'status-change',
          userId: currentUserId,
          requirementId: id,
          description: `将「${req.title}」状态从「${statusLabels[oldStatus]}」更新为「${statusLabels[status]}」`,
          metadata: { oldStatus, newStatus: status },
        });
      },

      addComment: (requirementId, content) => {
        const { currentUserId, requirements, addActivity } = get();
        const newComment: Comment = {
          id: `c${Date.now()}`,
          requirementId,
          userId: currentUserId,
          content,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          comments: [...state.comments, newComment],
        }));

        const req = requirements.find((r) => r.id === requirementId);
        if (req) {
          addActivity({
            projectId: req.projectId,
            type: 'comment',
            userId: currentUserId,
            requirementId,
            description: `在「${req.title}」中添加了评论`,
            metadata: { commentId: newComment.id },
          });
        }
      },

      addRequirement: (req) => {
        const newId = `r${Date.now()}`;
        const newReq: Requirement = {
          ...req,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          requirements: [...state.requirements, newReq],
        }));
        return newId;
      },

      updateRequirement: (id, updates) => {
        const { requirements, currentUserId, addActivity, getMilestoneById, getUserById } = get();
        const oldReq = requirements.find((r) => r.id === id);
        if (!oldReq) return;

        const fieldLabels: Record<string, string> = {
          title: '标题',
          description: '说明',
          assigneeId: '负责人',
          priority: '优先级',
          estimatedHours: '预计工时',
          dueDate: '截止日期',
          status: '状态',
          blocked: '阻塞状态',
          blockReason: '阻塞原因',
          milestoneId: '里程碑',
          tags: '标签',
        };

        const formatValue = (key: string, value: any): string => {
          if (value === null || value === undefined) return '空';
          if (key === 'assigneeId' && value) {
            const user = getUserById(value as string);
            return user?.name || value;
          }
          if (key === 'milestoneId' && value) {
            const milestone = getMilestoneById(value as string);
            return milestone?.name || value;
          }
          if (key === 'blocked') return value ? '是' : '否';
          if (key === 'priority') {
            const priorityMap: Record<string, string> = { high: '高', medium: '中', low: '低' };
            return priorityMap[value] || value;
          }
          if (key === 'status') {
            const statusMap: Record<string, string> = {
              'todo': '待处理',
              'in-progress': '进行中',
              'review': '评审中',
              'completed': '已完成',
            };
            return statusMap[value] || value;
          }
          if (key === 'tags' && Array.isArray(value)) return value.join(', ') || '空';
          if (key === 'dueDate' && value) return new Date(value).toLocaleDateString('zh-CN');
          if (key === 'estimatedHours') return `${value} 小时`;
          return String(value);
        };

        const changedFields: string[] = [];
        const changeDescriptions: string[] = [];
        Object.keys(updates).forEach((key) => {
          const oldValue = oldReq[key as keyof Requirement];
          const newValue = updates[key as keyof Requirement];
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            changedFields.push(key);
            const label = fieldLabels[key] || key;
            const oldDisplay = formatValue(key, oldValue);
            const newDisplay = formatValue(key, newValue);
            changeDescriptions.push(`${label}：${oldDisplay} → ${newDisplay}`);
          }
        });

        set((state) => ({
          requirements: state.requirements.map((r) =>
          r.id === id
            ? { ...r, ...updates, updatedAt: new Date().toISOString() }
            : r
        ),
        }));

        if (changedFields.length > 0) {
          const type = changedFields.includes('status') ? 'status-change' : 'update';
          addActivity({
            projectId: oldReq.projectId,
            type,
            userId: currentUserId,
            requirementId: id,
            description: `更新了「${oldReq.title}」`,
            metadata: {
              oldValues: oldReq,
              newValues: updates,
              changedFields,
              changeDetails: changeDescriptions,
            },
          });
        }
      },

      deleteRequirement: (id) => {
        const { requirements, currentUserId, addActivity } = get();
        const req = requirements.find((r) => r.id === id);
        if (!req) return;

        set((state) => ({
          requirements: state.requirements.filter((r) => r.id !== id),
          comments: state.comments.filter((c) => c.requirementId !== id),
          files: state.files.map((f) =>
            f.requirementId === id ? { ...f, requirementId: null } : f
          ),
        }));

        addActivity({
          projectId: req.projectId,
          type: 'delete',
          userId: currentUserId,
          requirementId: null,
          description: `删除了需求「${req.title}」`,
          metadata: { deletedId: id, deletedTitle: req.title },
        });
      },

      addFile: (file, changeLog = '初始版本') => {
        const { files, currentUserId } = get();
        const existingFile = files.find((f) => f.name === file.name && f.projectId === file.projectId);
        
        if (existingFile) {
          const newVersion: FileVersion = {
            id: `v${existingFile.versions.length + 1}-${existingFile.id}`,
            fileId: existingFile.id,
            version: existingFile.versions.length + 1,
            size: file.size,
            url: file.url,
            uploadedBy: currentUserId,
            uploadedAt: new Date().toISOString(),
            changeLog,
          };

          set((state) => ({
            files: state.files.map((f) =>
              f.id === existingFile.id
                ? {
                    ...f,
                    size: file.size,
                    url: file.url,
                    uploadedBy: currentUserId,
                    uploadedAt: new Date().toISOString(),
                    tags: file.tags.length > 0 ? file.tags : f.tags,
                    requirementId: file.requirementId !== null ? file.requirementId : f.requirementId,
                    currentVersion: existingFile.versions.length + 1,
                    versions: [...f.versions, newVersion],
                  }
                : f
            ),
          }));

          return existingFile.id;
        }

        const newId = `f${Date.now()}`;
        const initialVersion: FileVersion = {
          id: `v1-${newId}`,
          fileId: newId,
          version: 1,
          size: file.size,
          url: file.url,
          uploadedBy: file.uploadedBy,
          uploadedAt: new Date().toISOString(),
          changeLog,
        };

        const newFile: ProjectFile = {
          ...file,
          id: newId,
          uploadedAt: new Date().toISOString(),
          currentVersion: 1,
          versions: [initialVersion],
        };

        set((state) => ({
          files: [...state.files, newFile],
        }));
        return newId;
      },

      uploadNewVersion: (fileId, versionData, changeLog) => {
        const { files, currentUserId } = get();
        const file = files.find((f) => f.id === fileId);
        if (!file) return;

        const newVersionNumber = file.versions.length + 1;
        const newVersion: FileVersion = {
          id: `v${newVersionNumber}-${fileId}`,
          fileId,
          version: newVersionNumber,
          size: versionData.size,
          url: versionData.url,
          uploadedBy: currentUserId,
          uploadedAt: new Date().toISOString(),
          changeLog,
        };

        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  size: versionData.size,
                  url: versionData.url,
                  uploadedBy: currentUserId,
                  uploadedAt: new Date().toISOString(),
                  currentVersion: newVersionNumber,
                  versions: [...f.versions, newVersion],
                }
              : f
          ),
        }));
      },

      setFileVersion: (fileId, version) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, currentVersion: version } : f
          ),
        }));
      },

      linkFileToRequirement: (fileId, requirementId) => {
        const { files, requirements, currentUserId, addActivity } = get();
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, requirementId } : f
          ),
        }));

        const file = files.find((f) => f.id === fileId);
        const req = requirements.find((r) => r.id === requirementId);
        if (file && req) {
          addActivity({
            projectId: req.projectId,
            type: 'file-upload',
            userId: currentUserId,
            requirementId,
            description: `将文件「${file.name}」关联到「${req.title}」`,
            metadata: { fileId, requirementId },
          });
        }
      },

      unlinkFileFromRequirement: (fileId) => {
        const { files, requirements, currentUserId, addActivity } = get();
        const file = files.find((f) => f.id === fileId);
        const req = file?.requirementId ? requirements.find((r) => r.id === file.requirementId) : undefined;
        
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, requirementId: null } : f
          ),
        }));

        if (file && req) {
          addActivity({
            projectId: req.projectId,
            type: 'file-upload',
            userId: currentUserId,
            requirementId: req.id,
            description: `将文件「${file.name}」从「${req.title}」取消关联`,
            metadata: { fileId, requirementId: req.id },
          });
        }
      },

      confirmPendingItem: (id) => {
        set((state) => ({
          pendingItems: state.pendingItems.filter((p) => p.id !== id),
        }));
      },

      toggleDeliverable: (id) => {
        set((state) => ({
          deliverables: state.deliverables.map((d) =>
            d.id === id
              ? {
                  ...d,
                  completed: !d.completed,
                  completedAt: !d.completed ? new Date().toISOString() : null,
                }
              : d
          ),
        }));
      },

      addActivity: (activity) => {
        const newActivity: Activity = {
          ...activity,
          id: `a${Date.now()}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
      },
    }),
    {
      name: 'projecthub-storage',
      partialize: (state) => ({
        projects: state.projects,
        requirements: state.requirements,
        comments: state.comments,
        activities: state.activities,
        files: state.files,
        pendingItems: state.pendingItems,
        milestones: state.milestones,
        risks: state.risks,
        deliverables: state.deliverables,
        delayRecords: state.delayRecords,
        currentProjectId: state.currentProjectId,
      }),
    }
  )
);
