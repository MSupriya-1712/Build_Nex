import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';
import { ConstructionProgress } from './pages/ConstructionProgress';
import { FinanceBudget } from './pages/FinanceBudget';
import { MaterialInventory } from './pages/MaterialInventory';
import { CustomerManagement } from './pages/CustomerManagement';
import { Bookings } from './pages/Bookings';
import { TaskBoard } from './pages/TaskBoard';
import { ReportsAnalytics } from './pages/ReportsAnalytics';
import { AiAssistant } from './pages/AiAssistant';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetails />} />
        <Route path="progress" element={<ConstructionProgress />} />
        <Route path="finance" element={<FinanceBudget />} />
        <Route path="inventory" element={<MaterialInventory />} />
        <Route path="customers" element={<CustomerManagement />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="tasks" element={<TaskBoard />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="ai-assistant" element={<AiAssistant />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
