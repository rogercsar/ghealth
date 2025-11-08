import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { AuthProvider } from './auth/AuthProvider'
import { ModeProvider } from './context/ModeProvider'
import { applyBrandPalette } from './lib/palette'

// Deriva paleta da logo principal com fallback
applyBrandPalette('/ghealth_logo.png')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ModeProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ModeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
