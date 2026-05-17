import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DesktopLyrics } from '@/pages/DesktopLyrics'
import './lyrics.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DesktopLyrics />
  </StrictMode>,
)
