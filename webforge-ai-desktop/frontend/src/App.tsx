import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          {/* 他のルート (Builder, FontStudio, ChatDesigner など) はここに追加 */}
        </Routes>
      </AppShell>
    </Router>
  );
};

export default App;
