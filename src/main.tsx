import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: '22px',
            border: '1px solid rgba(185, 111, 104, .22)',
            background: 'rgba(255, 248, 245, .96)',
            color: '#6D5148',
            boxShadow: '0 22px 70px rgba(109, 81, 72, .14)',
            backdropFilter: 'blur(18px)',
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
