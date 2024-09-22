import 'react';

import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './Home';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/edit/:fileId',
    element: <App />,
  },
]);
