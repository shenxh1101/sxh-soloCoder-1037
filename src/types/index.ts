export type UserRole = 'product' | 'designer' | 'developer' | 'admin';

export type RequirementStatus = 'todo' | 'in-progress' | 'testing' | 'done' | 'cancelled';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type ActivityType = 'status-change' | 'comment' | 'file-upload' | 'assignment' | 'milestone';

export type MilestoneStatus = 'planning' | 'in-progress' | 'delayed' | 'completed';

export type RiskImpact = 'low' | 'medium' | 'high' | 'critical';

export type RiskProbability = 'low' | 'medium' | 'high';

export type RiskStatus = 'open' | 'mitigated' | 'resolved';

export type PendingItemType = 'decision' | 'approval' | 'feedback';

export interface User {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
}

export interface Requirement {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: RequirementStatus;
  priority: Priority;
  assigneeId: string | null;
  reporterId: string;
  estimatedHours: number;
  spentHours: number;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  milestoneId: string | null;
  blocked: boolean;
  blockReason: string | null;
}

export interface Comment {
  id: string;
  requirementId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  userId: string;
  requirementId: string | null;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  targetDate: string;
  actualDate: string | null;
  status: MilestoneStatus;
  progress: number;
  version: string;
}

export interface Risk {
  id: string;
  milestoneId: string;
  description: string;
  impact: RiskImpact;
  probability: RiskProbability;
  mitigation: string;
  ownerId: string;
  status: RiskStatus;
}

export interface Deliverable {
  id: string;
  milestoneId: string;
  name: string;
  description: string;
  completed: boolean;
  completedAt: string | null;
  attachmentUrl: string | null;
}

export interface DelayRecord {
  id: string;
  milestoneId: string;
  reason: string;
  delayDays: number;
  newTargetDate: string;
  approvedBy: string | null;
  createdAt: string;
}

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  changeLog: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
  requirementId: string | null;
  currentVersion: number;
  versions: FileVersion[];
}

export interface PendingItem {
  id: string;
  projectId: string;
  title: string;
  description: string;
  type: PendingItemType;
  createdBy: string;
  createdAt: string;
  dueDate: string | null;
}

export interface KanbanColumn {
  id: RequirementStatus;
  title: string;
  color: string;
}

export interface MemberWorkload {
  userId: string;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  estimatedHours: number;
  spentHours: number;
}

export type SearchResultType = 'requirement' | 'comment' | 'file' | 'milestone' | 'member';

export interface SearchResult {
  type: SearchResultType;
  id: string;
  title: string;
  description: string;
  highlight?: string;
  url: string;
}

export interface SearchResults {
  requirements: SearchResult[];
  comments: SearchResult[];
  files: SearchResult[];
  milestones: SearchResult[];
  members: SearchResult[];
}
