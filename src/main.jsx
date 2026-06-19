import React from 'react';
import ReactDOM from 'react-dom/client';
import { CustomDialog } from './app/shared-components/Dialog/DialogProvider';
import App from './app/App';
import '@mock-api';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CustomDialog>
      <App />
    </CustomDialog>
  </React.StrictMode>,
);
