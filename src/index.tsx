import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './global.css';

import { WithStore } from '@base/atom';
import { router } from './router';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <WithStore>
        <RouterProvider router={router}></RouterProvider>
      </WithStore>
    </React.StrictMode>,
  );
}
