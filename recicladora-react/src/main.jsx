import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles/global.css';
import {AuthProvider} from "./context/AuthProvider"

// Importar utilidades de debug en desarrollo
if (import.meta.env.DEV) {
    import('./utils/debug-auth.js');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      <BrowserRouter>
          <AuthProvider>
              <App />
          </AuthProvider>
      </BrowserRouter>
  </React.StrictMode>
)
