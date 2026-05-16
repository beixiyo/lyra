import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './locales'
import { App } from './App'
import 'comps/index.css'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
