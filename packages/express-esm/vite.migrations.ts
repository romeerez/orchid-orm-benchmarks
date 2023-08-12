import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
  plugins: VitePluginNode({
    adapter: 'express',
    appPath: './src/db/dbScript.ts',
  }),
});
