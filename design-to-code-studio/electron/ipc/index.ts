import { registerCodeGenIpcHandlers } from './code-gen.ipc';
import { registerDesignIpcHandlers } from './design.ipc';
import { registerFontIpc } from './font.ipc';
import { registerProjectIpcHandlers } from './projects.ipc';

export function registerIpcHandlers(): void {
  registerDesignIpcHandlers();
  registerCodeGenIpcHandlers();
  registerProjectIpcHandlers();
  registerFontIpc();
}
