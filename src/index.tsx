import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './global.css';

import { WithStore } from '@base/atom';
import { router } from './router';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <WithStore>
        <FluentProvider theme={webLightTheme} style={{
          height: '100%'
        }}>
          <RouterProvider router={router}></RouterProvider>
        </FluentProvider>
      </WithStore>
    </React.StrictMode>,
  );
}
