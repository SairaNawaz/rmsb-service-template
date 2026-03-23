import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// TODO: update basename to match your service's path_prefix (e.g. '/s2', '/hr')
const SERVICE_BASE = import.meta.env.VITE_SERVICE_BASE || '/svc';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={SERVICE_BASE}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
