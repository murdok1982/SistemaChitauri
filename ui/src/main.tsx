import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { App } from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/c2" element={<App initialTab="c2" />} />
        <Route path="/intel" element={<App initialTab="intel" />} />
        <Route path="/logistics" element={<App initialTab="logistics" />} />
        <Route path="/cyber" element={<App initialTab="cyber" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
