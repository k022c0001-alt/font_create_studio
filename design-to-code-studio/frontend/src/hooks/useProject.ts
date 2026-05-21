import { useCallback } from 'react';
import { useProjectStore } from '../store/projectStore';

/** Hook for project state and CRUD operations. */
export function useProject() {
  const { projects, currentProject, setProjects, setCurrentProject } = useProjectStore();

  const loadProjects = useCallback(async () => {
    // TODO: call electronAPI.listProjects() and update store
  }, [setProjects]);

  const selectProject = useCallback(
    (id: string) => {
      const found = projects.find((p) => p.id === id) ?? null;
      setCurrentProject(found);
    },
    [projects, setCurrentProject],
  );

  return { projects, currentProject, loadProjects, selectProject };
}
