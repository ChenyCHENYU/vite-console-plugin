import { Plugin } from 'vite';

declare global {
    var __vite_console_plugin_state__: {
        hasShownWelcome: boolean;
    } | undefined;
}
interface PluginOptions {
    systemName?: string;
    description?: string;
    team?: string;
    owner?: string;
    warning?: string;
    security?: string;
    autoVersion?: boolean;
}
declare const defaultPluginOptions: Required<PluginOptions>;
declare function viteConsolePlugin(options?: PluginOptions): Plugin;

export { type PluginOptions, viteConsolePlugin as default, defaultPluginOptions };
