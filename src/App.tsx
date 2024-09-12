import { Fragment, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './App.css';

const App = () => {
  return (
    <Fragment>
      <ul className="layout-sl">
        <li>
          <Link to="mindmap">MindMap</Link>
        </li>
        <li>
          <Link to="outline">Outline</Link>
        </li>
      </ul>
      <Outlet />
    </Fragment>
  );
};

export default App;
