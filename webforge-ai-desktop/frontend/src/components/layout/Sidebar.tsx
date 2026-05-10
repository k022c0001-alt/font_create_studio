import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1 className="app-title">WebForge AI</h1>
      </div>
      
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              📊 ダッシュボード
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/builder" className="nav-link">
              🎨 サイトビルダー
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/font-studio" className="nav-link">
              🔤 フォント作成
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/chat-designer" className="nav-link">
              💬 AIチャット
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/export" className="nav-link">
              📤 エクスポート
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <p className="version">v0.1.0-alpha</p>
      </div>
    </aside>
  );
};

export default Sidebar;
