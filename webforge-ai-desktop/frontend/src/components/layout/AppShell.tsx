import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import StatusBar from './StatusBar';
import './AppShell.css';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="app-shell">
      <TopBar />
      <div className="app-container">
        <Sidebar />
        <main className="app-main">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
};

export default AppShell;
