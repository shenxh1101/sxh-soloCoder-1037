import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        <div className="relative mb-8">
          <h1 className="text-[120px] font-black font-display bg-gradient-to-b from-primary-500 to-primary-700 bg-clip-text text-transparent leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-16 h-16 text-primary-500/20 animate-pulse" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-100 mb-3">页面未找到</h2>
        <p className="text-slate-400 mb-8 leading-relaxed">
          抱歉，您访问的页面不存在或已被移除。
          请检查URL是否正确，或返回首页继续浏览。
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
          >
            返回上一页
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/')}
          >
            返回首页
          </Button>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500 mb-4">您可能在找：</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { name: '首页', path: '/' },
              { name: '文件区', path: '/files' },
              { name: '成员', path: '/members' },
            ].map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
