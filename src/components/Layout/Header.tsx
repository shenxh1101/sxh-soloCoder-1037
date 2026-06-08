import React, { useState } from 'react';
import { ChevronDown, Bell, Search, Settings } from 'lucide-react';
import { useStore } from '../../store';
import { cn } from '../../utils';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { getRoleLabel } from '../../utils';

export const Header: React.FC = () => {
  const { getCurrentProject, getCurrentUser, projects, setCurrentProject } = useStore();
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const currentProject = getCurrentProject();
  const currentUser = getCurrentUser();

  return (
    <header className="h-16 bg-dark-200 border-b border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-100 border border-slate-700 hover:border-primary-500/50 transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentProject?.color }}
            />
            <span className="font-display font-medium text-white">
              {currentProject?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {projectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-dark-100 border border-slate-700 rounded-lg shadow-xl z-50 animate-fade-in">
              <div className="p-2">
                <p className="px-2 py-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  切换项目
                </p>
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setCurrentProject(project.id);
                      setProjectDropdownOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      currentProject?.id === project.id
                        ? 'bg-primary-600/20 text-primary-300'
                        : 'text-slate-300 hover:bg-dark-200'
                    )}
                  >
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {project.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="搜索需求、文件..."
            className="w-full pl-10 pr-4 py-2 bg-dark-100 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-primary-500 transition-colors font-mono"
          />
        </div>

        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
        </Button>

        <Button variant="ghost" size="sm">
          <Settings className="w-5 h-5" />
        </Button>

        <div className="relative ml-2">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-dark-100 transition-colors"
          >
            <Avatar src={currentUser?.avatar} name={currentUser?.name} size="sm" />
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-white">
                {currentUser?.name}
              </p>
              <p className="text-xs text-slate-500">
                {currentUser && getRoleLabel(currentUser.role)}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-dark-100 border border-slate-700 rounded-lg shadow-xl z-50 animate-fade-in">
              <div className="p-1">
                <button className="w-full px-3 py-2 text-left text-sm text-slate-300 rounded-md hover:bg-dark-200 transition-colors">
                  个人设置
                </button>
                <button className="w-full px-3 py-2 text-left text-sm text-slate-300 rounded-md hover:bg-dark-200 transition-colors">
                  账户安全
                </button>
                <hr className="my-1 border-slate-700" />
                <button className="w-full px-3 py-2 text-left text-sm text-danger-400 rounded-md hover:bg-dark-200 transition-colors">
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
