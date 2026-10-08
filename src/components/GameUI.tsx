import { useEffect, useState } from 'react'
import type { GameState, CameraView } from './GameContainer'

interface GameUIProps {
  gameState: GameState
  currentHour: number
  onStart: () => void
  onToggleFlashlight: () => void
  onToggleDoor: () => void
  onToggleCams: () => void
  onSetCamView: (view: CameraView) => void
  onSetPanDirection: (dir: 'left' | 'right' | null) => void
}

const GHOST_STATE_LABELS: Record<number, string> = {
  0: 'Stage',
  1: 'Cam 2',
  2: 'Cam 3',
  3: 'Door',
  4: 'Window',
}

export default function GameUI({
  gameState,
  currentHour,
  onStart,
  onToggleFlashlight,
  onToggleDoor,
  onToggleCams,
  onSetCamView,
  onSetPanDirection,
}: GameUIProps) {
  const { gameStatus, power, doorClosed, flashlightOn, cameraView, ghostPosition, jumpscare } =
    gameState

  const [isMobile, setIsMobile] = useState(false)
  const [flashlightCooldown, setFlashlightCooldown] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsMobile(
        window.matchMedia('(pointer: coarse)').matches ||
          /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
      )
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleFlashlight = () => {
    if (flashlightCooldown) return
    onToggleFlashlight()
    setFlashlightCooldown(true)
    setTimeout(() => setFlashlightCooldown(false), 200)
  }

  const powerColor =
    power > 50 ? '#44dd88' : power > 25 ? '#ddaa44' : '#dd4444'

  if (gameStatus === 'menu') {
    return (
      <div className="overlay menu-overlay">
        <div className="menu-content">
          <h1 className="game-title">
            FIVE NIGHTS
            <br />
            AT GHOSTS
          </h1>
          <p className="game-subtitle">Survive the night from 12 AM to 6 AM</p>
          <button className="start-button" onClick={onStart}>
            START NIGHT
          </button>
          <div className="controls-hint">
            <p><span className="key">A / D</span> Pan view left/right</p>
            <p><span className="key">Ctrl</span> Toggle flashlight</p>
            <p><span className="key">E</span> Open / Close door</p>
            <p><span className="key">Space</span> Toggle cameras</p>
          </div>
          {isMobile && (
            <div className="mobile-hint">
              <p>Touch controls are available during gameplay</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (gameStatus === 'gameover') {
    return (
      <div className={`overlay gameover-overlay ${jumpscare ? 'jumpscare-active' : ''}`}>
        {jumpscare && (
          <div className="jumpscare-flash">
            <div className="jumpscare-face">
              <div className="jumpscare-eye left" />
              <div className="jumpscare-eye right" />
              <div className="jumpscare-mouth" />
            </div>
          </div>
        )}
        <div className="gameover-content">
          <h1 className="gameover-title">YOU DIED</h1>
          <p className="gameover-subtitle">The ghost got you...</p>
          <button className="restart-button" onClick={onStart}>
            TRY AGAIN
          </button>
        </div>
      </div>
    )
  }

  if (gameStatus === 'won') {
    return (
      <div className="overlay win-overlay">
        <div className="win-content">
          <h1 className="win-title">6 AM</h1>
          <p className="win-subtitle">You survived the night!</p>
          <button className="restart-button" onClick={onStart}>
            PLAY AGAIN
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Top HUD bar */}
      <div className="hud-top">
        <div className="hud-time">
          <span className="hud-time-value">{currentHour} AM</span>
        </div>
        <div className="hud-power">
          <span className="hud-power-label">POWER</span>
          <div className="hud-power-bar">
            <div
              className="hud-power-fill"
              style={{ width: `${power}%`, backgroundColor: powerColor }}
            />
          </div>
          <span className="hud-power-value">{Math.ceil(power)}%</span>
        </div>
        <div className="hud-status">
          <span className={`status-indicator ${doorClosed ? 'active' : ''}`}>
            DOOR {doorClosed ? 'CLOSED' : 'OPEN'}
          </span>
          <span className={`status-indicator ${flashlightOn ? 'active' : ''}`}>
            LIGHT {flashlightOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Ghost tracker (subtle hint) */}
      <div className="ghost-tracker">
        <span className="ghost-tracker-label">SIGNAL: {GHOST_STATE_LABELS[ghostPosition]}</span>
      </div>

      {/* Camera overlay */}
      {cameraView !== 'office' && (
        <div className="cam-overlay">
          <div className="cam-header">
            <span className="cam-label">
              {cameraView === 'cam1' && 'CAM 1 — STAGE'}
              {cameraView === 'cam2' && 'CAM 2 — LEFT HALL'}
              {cameraView === 'cam3' && 'CAM 3 — RIGHT HALL'}
            </span>
            <span className="cam-rec">
              <span className="rec-dot" /> REC
            </span>
          </div>
          <div className="cam-scanlines" />
          <div className="cam-vignette" />
          <div className="cam-selector">
            <button
              className={`cam-btn ${cameraView === 'cam1' ? 'active' : ''}`}
              onClick={() => onSetCamView('cam1')}
            >
              CAM 1
            </button>
            <button
              className={`cam-btn ${cameraView === 'cam2' ? 'active' : ''}`}
              onClick={() => onSetCamView('cam2')}
            >
              CAM 2
            </button>
            <button
              className={`cam-btn ${cameraView === 'cam3' ? 'active' : ''}`}
              onClick={() => onSetCamView('cam3')}
            >
              CAM 3
            </button>
            <button className="cam-btn cam-close" onClick={onToggleCams}>
              EXIT
            </button>
          </div>
        </div>
      )}

      {/* Mobile pan arrows */}
      {isMobile && (
        <>
          <button
            className="pan-arrow pan-arrow-left"
            onTouchStart={(e) => {
              e.preventDefault()
              onSetPanDirection('left')
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              onSetPanDirection(null)
            }}
            onMouseDown={() => onSetPanDirection('left')}
            onMouseUp={() => onSetPanDirection(null)}
            onMouseLeave={() => onSetPanDirection(null)}
            aria-label="Pan left"
          >
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="pan-arrow pan-arrow-right"
            onTouchStart={(e) => {
              e.preventDefault()
              onSetPanDirection('right')
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              onSetPanDirection(null)
            }}
            onMouseDown={() => onSetPanDirection('right')}
            onMouseUp={() => onSetPanDirection(null)}
            onMouseLeave={() => onSetPanDirection(null)}
            aria-label="Pan right"
          >
            <svg viewBox="0 0 24 24" width="32" height="32">
              <path d="M9 6l6 6-6 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* Bottom control dock */}
      <div className="control-dock">
        <button
          className={`control-btn ${flashlightOn ? 'active' : ''}`}
          onClick={handleFlashlight}
          onTouchStart={(e) => {
            e.preventDefault()
            handleFlashlight()
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" className="btn-icon">
            <path
              d="M9 2L7 6v3a3 3 0 003 3h0a3 3 0 003-3V6L11 2H9zm1 14v6m-2 0h4"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="btn-label">Flashlight</span>
        </button>

        <button
          className={`control-btn ${doorClosed ? 'active danger' : ''}`}
          onClick={onToggleDoor}
          onTouchStart={(e) => {
            e.preventDefault()
            onToggleDoor()
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" className="btn-icon">
            <path
              d="M5 3h14v18H5V3zm4 8h6"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="btn-label">{doorClosed ? 'Open Door' : 'Close Door'}</span>
        </button>

        <button
          className={`control-btn ${cameraView !== 'office' ? 'active' : ''}`}
          onClick={onToggleCams}
          onTouchStart={(e) => {
            e.preventDefault()
            onToggleCams()
          }}
        >
          <svg viewBox="0 0 24 24" width="28" height="28" className="btn-icon">
            <path
              d="M3 7h14v10H3V7zm14 3l4-2v8l-4-2v-4z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="btn-label">Cams</span>
        </button>
      </div>
    </>
  )
}
