import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';

import { WithStore } from '@base/atom';
import { LayoutDemo } from './layout-demo';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <WithStore>
        <LayoutDemo />
      </WithStore>
    </React.StrictMode>,
  );
}
