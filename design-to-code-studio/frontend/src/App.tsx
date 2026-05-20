import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './pages/Dashboard';
import { DesignConverter } from './pages/DesignConverter';

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/converter" element={<DesignConverter />} />
        <Route path="/projects/:projectId" element={<DesignConverter />} />
      </Routes>
    </AppShell>
  );
}
