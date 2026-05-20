import { NavLink } from 'react-router-dom';

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <p className="sidebar__eyebrow">Claude Vision + Electron</p>
        <h1>Design-to-Code Studio</h1>
      </div>

      <nav className="sidebar__nav">
        <NavLink className="sidebar__link" to="/">
          ダッシュボード
        </NavLink>
        <NavLink className="sidebar__link" to="/converter">
          変換ワークスペース
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        <p>PNG / JPG / WEBP の UI スクリーンショットを解析し、React JSX と CSS を生成します。</p>
      </div>
    </aside>
  );
}
