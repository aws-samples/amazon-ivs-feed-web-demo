import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import StreamProvider from './contexts/Stream/provider';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <StreamProvider>
        <Route exact path="/">
          <Redirect to="/0" />
        </Route>
        <Route path="/:id">
          <App />
        </Route>
      </StreamProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
