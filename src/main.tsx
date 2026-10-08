import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/game.css'
import GameContainer from './components/GameContainer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameContainer />
  </StrictMode>,
)
