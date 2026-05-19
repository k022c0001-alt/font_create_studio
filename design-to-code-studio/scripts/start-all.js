import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function run(command, args, cwd, shell = false) {
  const child = spawn(command, args, { cwd, stdio: 'inherit', shell });
  child.on('exit', (code) => {
    if (code !== 0) {
      process.exitCode = code ?? 1;
    }
  });
  return child;
}

const py = run('python', ['main.py'], path.join(root, 'python_backend'));
const vite = run('npx', ['vite', '--config', 'frontend/vite.config.ts'], root);
const electron = run('npx wait-on http://localhost:5180 && npx electron .', [], root, true);

process.on('SIGINT', () => {
  py.kill('SIGINT');
  vite.kill('SIGINT');
  electron.kill('SIGINT');
});
