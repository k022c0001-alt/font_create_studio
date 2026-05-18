import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import FontStudio from './pages/FontStudio';
import './styles/global.css';

const App: React.FC = () => {
  return (
    <Router>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/font-studio" element={<FontStudio />} />
        </Routes>
      </AppShell>
    </Router>
  );
};

export default App;
