import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Requirements from '@/pages/Requirements';
import Kanban from '@/pages/Kanban';
import Milestones from '@/pages/Milestones';
import Files from '@/pages/Files';
import Members from '@/pages/Members';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-dark-300 bg-noise gradient-mesh">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/projects/p1/dashboard" replace />} />
          <Route path="/projects/:projectId" element={<Layout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requirements" element={<Requirements />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="milestones" element={<Milestones />} />
            <Route path="files" element={<Files />} />
            <Route path="members" element={<Members />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
}
