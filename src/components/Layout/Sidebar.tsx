import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Kanban,
  Flag,
  FolderOpen,
  Users,
  ChevronDown,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { cn } from '../../utils';
import { useStore } from '../../store';
import { getRoleLabel } from '../../utils';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const getNavItems = (projectId: string): NavItem[] => [
  { icon: LayoutDashboard, label: '仪表盘', path: `/projects/${projectId}/dashboard` },
  { icon: ListTodo, label: '需求列表', path: `/projects/${projectId}/requirements` },
  { icon: Kanban, label: '看板', path: `/projects/${projectId}/kanban` },
  { icon: Flag, label: '里程碑', path: `/projects/${projectId}/milestones` },
  { icon: FolderOpen, label: '文件区', path: `/projects/${projectId}/files` },
  { icon: Users, label: '成员', path: `/projects/${projectId}/members` },
];

const colorOptions = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '绿色', value: '#10b981' },
  { name: '紫色', value: '#8b5cf6' },
  { name: '橙色', value: '#f59e0b' },
  { name: '红色', value: '#ef4444' },
  { name: '青色', value: '#06b6d4' },
];

export const Sidebar: React.FC = () => {
  const { projects, currentProjectId, setCurrentProject, getCurrentUser, addProject } = useStore();
  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3b82f6');
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const navItems = getNavItems(currentProjectId);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newId = addProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim(),
        color: newProjectColor,
        icon: 'folder',
      });
      setCurrentProject(newId);
      navigate(`/projects/${newId}/dashboard`);
      setNewProjectName('');
      setNewProjectDesc('');
      setNewProjectColor('#3b82f6');
      setShowNewProjectModal(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setCurrentProject(projectId);
    navigate(`/projects/${projectId}/dashboard`);
  };

  return (
    <>
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
          <div className="flex items-center justify-between px-2 py-1.5">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center justify-between gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span className="uppercase tracking-wider">项目</span>
              {projectsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => setShowNewProjectModal(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {projectsExpanded && (
            <div className="mt-2 space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleProjectSelect(project.id)}
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

      <Modal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        title="创建新项目"
      >
        <div className="space-y-4">
          <Input
            label="项目名称"
            placeholder="输入项目名称"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
          />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              项目描述
            </label>
            <textarea
              className="w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors resize-none h-20"
              placeholder="简要描述项目目标"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              项目颜色
            </label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setNewProjectColor(color.value)}
                  className={cn(
                    'w-8 h-8 rounded-full border-2 transition-all',
                    newProjectColor === color.value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  )}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowNewProjectModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
            >
              创建项目
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Sidebar;
