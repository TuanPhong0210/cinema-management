import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';
import { applyTheme } from './hooks/useTheme';

const savedTheme = localStorage.getItem('theme');
const preferredTheme = window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme(savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : preferredTheme);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
