import React, { createElement } from 'react';
import ReactDOM from 'react-dom/client';
import './global.css';

import { WithStore } from '@base/atom';
import { LayoutDemo } from './components/mind-map';
import { OutlineView } from './components/outline';

const search = new URLSearchParams(location.search);
const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <WithStore>
        {createElement(search.get('view') === 'outline' ? OutlineView : LayoutDemo)}
      </WithStore>
    </React.StrictMode>,
  );
}
