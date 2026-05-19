import { registerCodeGenIpcHandlers } from './code-gen.ipc';
import { registerDesignIpcHandlers } from './design.ipc';
import { registerProjectIpcHandlers } from './projects.ipc';
export function registerIpcHandlers() {
    registerDesignIpcHandlers();
    registerCodeGenIpcHandlers();
    registerProjectIpcHandlers();
}
