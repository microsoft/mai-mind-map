import 'react';

import { createHashRouter } from 'react-router-dom';
import App from './App';
import { MindMapView } from './components/mind-map/Index';
import { OutlineView } from './components/outline';

export const router = createHashRouter([
  {
    path: '/', // redirect to mind-map
    element: <App />,
    children: [
      {
        index: true,
        path: '',
        element: <MindMapView />,
      },
      {
        path: 'mindmap',
        element: <MindMapView />,
      },
      {
        path: 'outline',
        element: <OutlineView />,
      },
    ],
  },
]);
