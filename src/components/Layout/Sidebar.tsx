import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Flag,
  FolderOpen,
  Activity,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils';
import { useStore } from '../../store';
import { getRoleLabel } from '../../utils';
import { Avatar } from '../ui/Avatar';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '仪表盘', path: '/' },
  { icon: Kanban, label: '需求看板', path: '/kanban' },
  { icon: Flag, label: '里程碑', path: '/milestones' },
  { icon: FolderOpen, label: '文件管理', path: '/files' },
  { icon: Activity, label: '活动日志', path: '/activity' },
  { icon: AlertTriangle, label: '风险跟踪', path: '/risks' },
  { icon: Clock, label: '待办事项', path: '/pending' },
];

export const Sidebar: React.FC = () => {
  const { projects, currentProjectId, setCurrentProject, getCurrentUser } = useStore();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const currentUser = getCurrentUser();

  return (
    <aside className="w-64 bg-dark-200 border-r border-slate-800 flex flex-col h-screen">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white">ProjectHub</h1>
            <p className="text-xs text-slate-500">项目管理平台</p>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-slate-800">
        <button
          onClick={() => setProjectsExpanded(!projectsExpanded)}
          className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
        >
          <span className="uppercase tracking-wider">项目</span>
          {projectsExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {projectsExpanded && (
          <div className="mt-2 space-y-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setCurrentProject(project.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                  currentProjectId === project.id
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                    : 'text-slate-400 hover:bg-dark-100 hover:text-white'
                )}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate font-mono text-xs">{project.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wider">
          导航
        </p>
        <div className="mt-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                    isActive
                      ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-400 hover:bg-dark-100 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-mono">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {currentUser && (
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-dark-100 transition-colors">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {getRoleLabel(currentUser.role)}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
