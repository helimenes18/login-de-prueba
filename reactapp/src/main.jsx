// Debe cargarse antes que la app: fuerza el dominio propio (predictibes.me).
import { redirigiendoAlDominio } from './lib/sitio';
// Debe cargarse antes que la app: captura el error de OAuth que llega en la URL.
import './lib/authError';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import { aplicarTemaGuardado } from './lib/useTheme';

aplicarTemaGuardado();

if (!redirigiendoAlDominio) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
