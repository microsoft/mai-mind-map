import path from 'node:path';
import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

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

const IS_PROD = process.env.BUILD_CONFIG === 'prod';
export default defineConfig({
  source: {
    define: {
      __IS_PROD__: IS_PROD,
      __IS_DEV__: !IS_PROD,
    },
  },
  plugins: [pluginReact()],
  html: {
    favicon: path.resolve(__dirname, './src/assets/favicon.ico'),
    title: 'MAI mind map',
  },
  server: {
    port: normalizePort(process.env.PORT || '3000'),
    proxy: {
      '/api': {
        target: 'https://mai-mind-map.azurewebsites.net',
        changeOrigin: true,
        secure: false,
      },
    }
  },
});
