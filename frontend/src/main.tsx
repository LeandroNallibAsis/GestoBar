import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Application entrypoint mounts the React app into the document.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
