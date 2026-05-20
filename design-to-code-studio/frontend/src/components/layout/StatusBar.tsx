import { useDesignStore } from '../../store/designStore';

export function StatusBar() {
  const { isLoading, error, currentProject, exportPath } = useDesignStore();
  const status = error ? `Error: ${error}` : isLoading ? 'Processing design…' : 'Ready';

  return (
    <footer className="statusbar">
      <span>{status}</span>
      <span>{currentProject ? `Project: ${currentProject.name}` : 'No project selected'}</span>
      <span>{exportPath ? `Exported to ${exportPath}` : 'No export yet'}</span>
    </footer>
  );
}
