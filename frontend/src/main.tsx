/**
 * ============================================================
 * main.tsx
 * ============================================================
 * Punto de entrada principal de la aplicación frontend GestoBar.
 * Este archivo es el "bootstrapper" que monta el árbol de componentes
 * React en el elemento DOM raíz (#root) definido en index.html.
 *
 * Se utiliza React.StrictMode para activar verificaciones adicionales
 * en desarrollo (detecta efectos secundarios, APIs obsoletas, etc.).
 * También importa los estilos globales desde index.css (Tailwind CSS).
 *
 * Módulo: Punto de entrada (Frontend)
 * ============================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Importación de estilos globales (incluye configuración de Tailwind CSS)
import './index.css';

/**
 * Montaje de la aplicación React.
 * Se obtiene el elemento DOM con id="root" y se crea la raíz de React 18+
 * usando createRoot (API de renderizado concurrente).
 * React.StrictMode envuelve la app para detectar problemas potenciales
 * durante el desarrollo sin afectar la versión de producción.
 */
// Application entrypoint mounts the React app into the document.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
