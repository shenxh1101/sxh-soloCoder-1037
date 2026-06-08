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
  getPendingItemsByProject: (projectId: string) => PendingItem[];
  getBlockedRequirements: (projectId: string) => Requirement[];
  getMemberWorkload: (projectId: string) => MemberWorkload[];
  getProjectProgress: (projectId: string) => number;

  setCurrentProject: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => string;
  updateRequirementStatus: (id: string, status: RequirementStatus) => void;
  addComment: (requirementId: string, content: string) => void;
  addRequirement: (req: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt'>) => string;
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
        set((state) => ({
          files: state.files.map((f) =>
            f.id === fileId ? { ...f, requirementId: null } : f
          ),
        }));
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
