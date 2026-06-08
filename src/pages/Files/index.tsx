import { useState, useMemo } from 'react';
import { Grid3X3, List, Search, Upload, Filter, Download, Trash2, Eye, FileImage, FileText, FileSpreadsheet, Palette, Archive, File } from 'lucide-react';
import { useStore } from '../../store';
import { formatFileSize, formatDateTime, getFileIcon, cn } from '../../utils';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Tag } from '../../components/ui/Tag';
import { Avatar } from '../../components/ui/Avatar';
import type { ProjectFile } from '../../types';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'document' | 'spreadsheet' | 'design' | 'archive';
type FilterTime = 'all' | 'today' | 'week' | 'month';

const fileIcons: Record<string, React.ElementType> = {
  image: FileImage,
  'file-text': FileText,
  sheet: FileSpreadsheet,
  palette: Palette,
  archive: Archive,
  file: File,
};

export default function Files() {
  const { currentProjectId, getFilesByProject, getUserById } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [timeFilter, setTimeFilter] = useState<FilterTime>('all');
  const [uploaderFilter, setUploaderFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const projectFiles = getFilesByProject(currentProjectId);

  const filteredFiles = useMemo(() => {
    let result = [...projectFiles];
    if (searchQuery) {
      result = result.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (typeFilter !== 'all') {
      result = result.filter((f) => getFileIcon(f.type) === typeFilter);
    }
    if (timeFilter !== 'all') {
      const now = new Date();
      result = result.filter((f) => {
        const diffDays = Math.floor((now.getTime() - new Date(f.uploadedAt).getTime()) / 86400000);
        if (timeFilter === 'today') return diffDays === 0;
        if (timeFilter === 'week') return diffDays <= 7;
        if (timeFilter === 'month') return diffDays <= 30;
        return true;
      });
    }
    if (uploaderFilter !== 'all') {
      result = result.filter((f) => f.uploadedBy === uploaderFilter);
    }
    return result;
  }, [projectFiles, searchQuery, typeFilter, timeFilter, uploaderFilter]);

  const uploaders = useMemo(() => {
    const uniqueUploaders = new Set(projectFiles.map((f) => f.uploadedBy));
    return Array.from(uniqueUploaders).map((id) => getUserById(id)).filter(Boolean);
  }, [projectFiles, getUserById]);

  const FileIcon = ({ type }: { type: string }) => {
    const IconComponent = fileIcons[getFileIcon(type)] || File;
    return <IconComponent className="w-8 h-8" />;
  };

  const Thumbnail = ({ file }: { file: ProjectFile }) => {
    const icon = getFileIcon(file.type);
    if (icon === 'image' && file.url.startsWith('http')) {
      return <img src={file.url} alt={file.name} className="w-full h-full object-cover rounded-lg" />;
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-dark-200 rounded-lg">
        <FileIcon type={file.type} />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-display text-slate-100">文件区</h1>
        <Button icon={Upload}>上传文件</Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="搜索文件名或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-dark-100 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <Button
            variant="secondary"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(showFilters && 'bg-primary-600/20 border-primary-500/50 text-primary-400')}
          >
            筛选
          </Button>
          <div className="flex items-center bg-dark-100 border border-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('p-2 rounded-md transition-colors', viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white')}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-md transition-colors', viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white')}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {showFilters && (
          <Card className="p-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">文件类型</label>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as FilterType)} className="w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="all">全部类型</option>
                  <option value="image">图片</option>
                  <option value="document">文档</option>
                  <option value="spreadsheet">表格</option>
                  <option value="design">设计稿</option>
                  <option value="archive">压缩包</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">上传时间</label>
                <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as FilterTime)} className="w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="all">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">本周</option>
                  <option value="month">本月</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">上传者</label>
                <select value={uploaderFilter} onChange={(e) => setUploaderFilter(e.target.value)} className="w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="all">全部人员</option>
                  {uploaders.map((user) => user && <option key={user.id} value={user.id}>{user.name}</option>)}
                </select>
              </div>
            </div>
          </Card>
        )}
      </div>

      {filteredFiles.length === 0 ? (
        <div className="text-center py-16">
          <File className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无符合条件的文件</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredFiles.map((file) => {
            const uploader = getUserById(file.uploadedBy);
            return (
              <Card key={file.id} hover className="group relative overflow-hidden" onMouseEnter={() => setHoveredFile(file.id)} onMouseLeave={() => setHoveredFile(null)}>
                <div className="aspect-square p-4">
                  <div className="w-full h-40 mb-3 overflow-hidden rounded-lg">
                    <Thumbnail file={file} />
                  </div>
                  <h3 className="font-medium text-slate-200 truncate">{file.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{formatFileSize(file.size)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {uploader && <Avatar src={uploader.avatar} name={uploader.name} size="sm" />}
                    <span className="text-xs text-slate-500">{uploader?.name}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {file.tags.slice(0, 2).map((tag) => <Tag key={tag} variant="default">{tag}</Tag>)}
                    {file.tags.length > 2 && <Tag variant="default">+{file.tags.length - 2}</Tag>}
                  </div>
                </div>
                {hoveredFile === file.id && (
                  <div className="absolute inset-0 bg-dark-300/90 backdrop-blur-sm flex items-center justify-center gap-3 animate-fade-in">
                    <Button variant="secondary" size="sm" icon={Eye} />
                    <Button variant="secondary" size="sm" icon={Download} />
                    <Button variant="danger" size="sm" icon={Trash2} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">文件名</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">大小</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">上传者</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">上传时间</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">标签</th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredFiles.map((file, index) => {
                  const uploader = getUserById(file.uploadedBy);
                  return (
                    <tr key={file.id} className={cn('border-b border-slate-800/50 hover:bg-dark-200/50 transition-colors', index === filteredFiles.length - 1 && 'border-b-0')}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-dark-200 rounded-lg text-primary-400">
                            <FileIcon type={file.type} />
                          </div>
                          <span className="font-medium text-slate-200">{file.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{formatFileSize(file.size)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {uploader && <Avatar src={uploader.avatar} name={uploader.name} size="sm" />}
                          <span className="text-slate-300">{uploader?.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">{formatDateTime(file.uploadedAt)}</td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1.5">
                          {file.tags.map((tag) => <Tag key={tag} variant="default">{tag}</Tag>)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" icon={Eye} />
                          <Button variant="ghost" size="sm" icon={Download} />
                          <Button variant="ghost" size="sm" icon={Trash2} className="text-danger-500 hover:text-danger-400" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
