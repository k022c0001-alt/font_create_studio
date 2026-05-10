import React from 'react';
import './TopBar.css';

const TopBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = React.useState(false);

  const handleMinimize = () => {
    // Electron IPC を使用して最小化
    window.electronAPI?.window?.minimize?.();
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    window.electronAPI?.window?.maximize?.();
  };

  const handleClose = () => {
    // Electron IPC を使用して閉じる
    window.electronAPI?.window?.close?.();
  };

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <h2 className="page-title">WebForge AI Desktop</h2>
      </div>
      
      <div className="top-bar-right">
        <div className="window-controls">
          <button 
            className="window-control-btn minimize"
            onClick={handleMinimize}
            title="最小化"
          >
            −
          </button>
          <button 
            className="window-control-btn maximize"
            onClick={handleMaximize}
            title="最大化"
          >
            □
          </button>
          <button 
            className="window-control-btn close"
            onClick={handleClose}
            title="閉じる"
          >
            ✕
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
