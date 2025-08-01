import { Plugin } from 'vite';

declare global {
    var __vite_console_plugin_state__: {
        hasShownWelcome: boolean;
    } | undefined;
}
interface PluginOptions {
    systemName?: string;
    version?: string;
    team?: string;
    owner?: string;
    warning?: string;
    security?: string;
}
declare const defaultPluginOptions: Required<PluginOptions>;
declare function viteConsolePlugin(options?: PluginOptions): Plugin;

export { type PluginOptions, viteConsolePlugin as default, defaultPluginOptions };
