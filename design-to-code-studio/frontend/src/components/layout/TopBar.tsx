import { useLocation } from 'react-router-dom';

export function TopBar() {
  const location = useLocation();
  const title = location.pathname === '/' ? 'Project Dashboard' : 'Design Converter';

  return (
    <header className="topbar">
      <div>
        <p className="topbar__label">Desktop workspace</p>
        <h2>{title}</h2>
      </div>
      <div className="topbar__meta">SQLite project history enabled</div>
    </header>
  );
}
