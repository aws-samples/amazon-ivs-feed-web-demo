import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

import StreamProvider from './contexts/Stream/provider';

import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <StreamProvider>
      <App />
    </StreamProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorker.unregister();
