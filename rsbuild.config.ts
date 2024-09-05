import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import path from 'node:path';

function normalizePort(val) {
  const port = Number.parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

export default defineConfig({
  plugins: [pluginReact()],
  html: {
    favicon: path.resolve(__dirname, './src/assets/favicon.ico'),
    title: 'MSAI mind map',
  },
  server: {
    port: normalizePort(process.env.PORT || '3000'),
  },
});
