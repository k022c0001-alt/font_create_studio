import React, { useEffect, useState } from 'react';
import './Dashboard.css';

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
}

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    // TODO: IPC でプロジェクト一覧を取得
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      // const projects = await window.electronAPI?.project?.list?.();
      // setProjects(projects || []);
      
      // 今はダミーデータ
      setProjects([
        {
          id: '1',
          name: 'Sample Project 1',
          description: 'テストプロジェクト',
          createdAt: '2026-05-10',
          updatedAt: '2026-05-10',
        },
        {
          id: '2',
          name: 'Sample Project 2',
          description: 'ポートフォリオサイト',
          createdAt: '2026-05-09',
          updatedAt: '2026-05-09',
        },
      ]);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      // TODO: IPC でプロジェクト作成
      // await window.electronAPI?.project?.create?.({ name: newProjectName });
      
      setNewProjectName('');
      setShowCreateModal(false);
      await loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>ダッシュボード</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ 新規プロジェクト
        </button>
      </div>

      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-spinner">
            <p>読み込み中...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>まだプロジェクトはありません</p>
            <p>新規プロジェクトを作成して始めましょう</p>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-thumbnail">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} />
                  ) : (
                    <div className="placeholder">📄</div>
                  )}
                </div>
                <div className="project-info">
                  <h3>{project.name}</h3>
                  <p className="description">{project.description}</p>
                  <p className="meta">
                    更新: {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="project-actions">
                  <button className="btn btn-small">開く</button>
                  <button className="btn btn-small btn-danger">削除</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>新規プロジェクト</h2>
            <input
              type="text"
              placeholder="プロジェクト名を入力"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="input-field"
              autoFocus
            />
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateModal(false)}
              >
                キャンセル
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateProject}
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
