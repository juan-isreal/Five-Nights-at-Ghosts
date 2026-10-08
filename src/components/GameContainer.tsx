import { useState, useEffect, useRef, useCallback } from 'react'
import OfficeCanvas from './OfficeCanvas'
import GameUI from './GameUI'

export type GhostState = 0 | 1 | 2 | 3 | 4
export type GameStatus = 'menu' | 'playing' | 'gameover' | 'won'
export type CameraView = 'office' | 'cam1' | 'cam2' | 'cam3'

export interface GameState {
  ghostPosition: GhostState
  doorClosed: boolean
  flashlightOn: boolean
  panAngle: number
  cameraView: CameraView
  power: number
  timeElapsed: number
  gameStatus: GameStatus
  jumpscare: boolean
}

const STAGE: GhostState = 0
const DOOR: GhostState = 3
const WINDOW: GhostState = 4

const NIGHT_DURATION = 360
const POWER_DRAIN_BASE = 0.08
const POWER_DRAIN_FLASHLIGHT = 0.15
const POWER_DRAIN_DOOR = 0.2
const POWER_DRAIN_CAMS = 0.1

export default function GameContainer() {
  const [ghostPosition, setGhostPosition] = useState<GhostState>(STAGE)
  const [doorClosed, setDoorClosed] = useState(false)
  const [flashlightOn, setFlashlightOn] = useState(false)
  const [panAngle, setPanAngle] = useState(0)
  const [cameraView, setCameraView] = useState<CameraView>('office')
  const [power, setPower] = useState(100)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [gameStatus, setGameStatus] = useState<GameStatus>('menu')
  const [jumpscare, setJumpscare] = useState(false)
  const [currentHour, setCurrentHour] = useState(12)

  const ghostPositionRef = useRef<GhostState>(STAGE)
  const doorClosedRef = useRef(false)
  const flashlightOnRef = useRef(false)
  const cameraViewRef = useRef<CameraView>('office')
  const gameStatusRef = useRef<GameStatus>('menu')
  const powerRef = useRef(100)
  const windowLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const windowIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const powerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const gameTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const ghostMoveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const panDirectionRef = useRef<'left' | 'right' | null>(null)
  const panFrameRef = useRef<number | null>(null)

  const syncRef = useCallback(() => {
    ghostPositionRef.current = ghostPosition
    doorClosedRef.current = doorClosed
    flashlightOnRef.current = flashlightOn
    cameraViewRef.current = cameraView
    gameStatusRef.current = gameStatus
    powerRef.current = power
  }, [ghostPosition, doorClosed, flashlightOn, cameraView, gameStatus, power])

  useEffect(() => {
    syncRef()
  }, [syncRef])

  const clearGhostTimers = useCallback(() => {
    if (windowLockTimerRef.current) {
      clearTimeout(windowLockTimerRef.current)
      windowLockTimerRef.current = null
    }
    if (windowIntervalRef.current) {
      clearInterval(windowIntervalRef.current)
      windowIntervalRef.current = null
    }
  }, [])

  const triggerJumpscare = useCallback(() => {
    setJumpscare(true)
    setGameStatus('gameover')
    gameStatusRef.current = 'gameover'
    clearGhostTimers()
    if (powerTimerRef.current) {
      clearInterval(powerTimerRef.current)
      powerTimerRef.current = null
    }
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current)
      gameTimerRef.current = null
    }
    if (ghostMoveTimerRef.current) {
      clearInterval(ghostMoveTimerRef.current)
      ghostMoveTimerRef.current = null
    }
  }, [clearGhostTimers])

  const advanceGhost = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return
    const current = ghostPositionRef.current
    if (current === WINDOW) return
    if (current === DOOR) return
    const next = (current + 1) as GhostState
    ghostPositionRef.current = next
    setGhostPosition(next)
  }, [])

  const handleDoorClose = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return
    if (doorClosedRef.current) return
    if (powerRef.current <= 0) return

    const currentGhost = ghostPositionRef.current
    doorClosedRef.current = true
    setDoorClosed(true)

    if (currentGhost === DOOR) {
      ghostPositionRef.current = WINDOW
      setGhostPosition(WINDOW)

      clearGhostTimers()

      windowLockTimerRef.current = setTimeout(() => {
        windowIntervalRef.current = setInterval(() => {
          if (gameStatusRef.current !== 'playing') {
            clearGhostTimers()
            return
          }
          if (doorClosedRef.current) {
            if (Math.random() < 0.25) {
              clearGhostTimers()
              ghostPositionRef.current = STAGE
              setGhostPosition(STAGE)
            }
          } else {
            clearGhostTimers()
            ghostPositionRef.current = DOOR
            setGhostPosition(DOOR)
          }
        }, 1500)
      }, 2000)
    }
  }, [clearGhostTimers])

  const handleDoorOpen = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return
    if (!doorClosedRef.current) return

    doorClosedRef.current = false
    setDoorClosed(false)

    const currentGhost = ghostPositionRef.current
    if (currentGhost === DOOR) {
      triggerJumpscare()
    }
  }, [triggerJumpscare])

  const toggleFlashlight = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return
    if (powerRef.current <= 0) {
      flashlightOnRef.current = false
      setFlashlightOn(false)
      return
    }
    setFlashlightOn((prev) => {
      const next = !prev
      flashlightOnRef.current = next
      return next
    })
  }, [])

  const toggleCams = useCallback(() => {
    if (gameStatusRef.current !== 'playing') return
    setCameraView((prev) => {
      if (prev === 'office') {
        cameraViewRef.current = 'cam1'
        return 'cam1'
      }
      if (prev === 'cam1') {
        cameraViewRef.current = 'cam2'
        return 'cam2'
      }
      if (prev === 'cam2') {
        cameraViewRef.current = 'cam3'
        return 'cam3'
      }
      cameraViewRef.current = 'office'
      return 'office'
    })
  }, [])

  const setCamView = useCallback((view: CameraView) => {
    if (gameStatusRef.current !== 'playing') return
    cameraViewRef.current = view
    setCameraView(view)
  }, [])

  const setPanDirection = useCallback((dir: 'left' | 'right' | null) => {
    panDirectionRef.current = dir
  }, [])

  useEffect(() => {
    const animate = () => {
      if (panDirectionRef.current === 'left') {
        setPanAngle((prev) => Math.max(-45, prev - 1.5))
      } else if (panDirectionRef.current === 'right') {
        setPanAngle((prev) => Math.min(45, prev + 1.5))
      }
      panFrameRef.current = requestAnimationFrame(animate)
    }
    panFrameRef.current = requestAnimationFrame(animate)
    return () => {
      if (panFrameRef.current) cancelAnimationFrame(panFrameRef.current)
    }
  }, [])

  const startGame = useCallback(() => {
    setGhostPosition(STAGE)
    setDoorClosed(false)
    setFlashlightOn(false)
    setPanAngle(0)
    setCameraView('office')
    setPower(100)
    setTimeElapsed(0)
    setGameStatus('playing')
    setJumpscare(false)
    setCurrentHour(12)

    ghostPositionRef.current = STAGE
    doorClosedRef.current = false
    flashlightOnRef.current = false
    cameraViewRef.current = 'office'
    gameStatusRef.current = 'playing'
    powerRef.current = 100

    clearGhostTimers()
    if (powerTimerRef.current) clearInterval(powerTimerRef.current)
    if (gameTimerRef.current) clearInterval(gameTimerRef.current)
    if (ghostMoveTimerRef.current) clearInterval(ghostMoveTimerRef.current)

    ghostMoveTimerRef.current = setInterval(() => {
      if (gameStatusRef.current !== 'playing') return
      if (ghostPositionRef.current === WINDOW || ghostPositionRef.current === DOOR) return
      if (Math.random() < 0.35) {
        advanceGhost()
      }
    }, 4000)

    powerTimerRef.current = setInterval(() => {
      if (gameStatusRef.current !== 'playing') return
      let drain = POWER_DRAIN_BASE
      if (flashlightOnRef.current) drain += POWER_DRAIN_FLASHLIGHT
      if (doorClosedRef.current) drain += POWER_DRAIN_DOOR
      if (cameraViewRef.current !== 'office') drain += POWER_DRAIN_CAMS

      powerRef.current = Math.max(0, powerRef.current - drain)
      setPower(powerRef.current)

      if (powerRef.current <= 0) {
        setFlashlightOn(false)
        flashlightOnRef.current = false
        setDoorClosed(false)
        doorClosedRef.current = false
        setCameraView('office')
        cameraViewRef.current = 'office'
      }
    }, 1000)

    gameTimerRef.current = setInterval(() => {
      if (gameStatusRef.current !== 'playing') return
      setTimeElapsed((prev) => {
        const next = prev + 1
        const hour = Math.floor((next / NIGHT_DURATION) * 6) + 12
        if (hour > 6 && next >= NIGHT_DURATION) {
          setGameStatus('won')
          gameStatusRef.current = 'won'
          clearGhostTimers()
          if (powerTimerRef.current) {
            clearInterval(powerTimerRef.current)
            powerTimerRef.current = null
          }
          if (ghostMoveTimerRef.current) {
            clearInterval(ghostMoveTimerRef.current)
            ghostMoveTimerRef.current = null
          }
          return next
        }
        if (hour <= 6) {
          setCurrentHour(hour)
        } else if (next >= NIGHT_DURATION) {
          setCurrentHour(6)
        }
        return next
      })
    }, 1000)
  }, [advanceGhost, clearGhostTimers])

  useEffect(() => {
    return () => {
      clearGhostTimers()
      if (powerTimerRef.current) clearInterval(powerTimerRef.current)
      if (gameTimerRef.current) clearInterval(gameTimerRef.current)
      if (ghostMoveTimerRef.current) clearInterval(ghostMoveTimerRef.current)
      if (panFrameRef.current) cancelAnimationFrame(panFrameRef.current)
    }
  }, [clearGhostTimers])

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (gameStatusRef.current === 'menu') {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault()
          startGame()
        }
        return
      }
      if (gameStatusRef.current === 'gameover' || gameStatusRef.current === 'won') {
        if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyR') {
          e.preventDefault()
          startGame()
        }
        return
      }

      switch (e.code) {
        case 'KeyA':
          e.preventDefault()
          panDirectionRef.current = 'left'
          break
        case 'KeyD':
          e.preventDefault()
          panDirectionRef.current = 'right'
          break
        case 'ControlLeft':
        case 'ControlRight':
          e.preventDefault()
          toggleFlashlight()
          break
        case 'KeyE':
          e.preventDefault()
          if (doorClosedRef.current) {
            handleDoorOpen()
          } else {
            handleDoorClose()
          }
          break
        case 'Space':
          e.preventDefault()
          toggleCams()
          break
      }
    }

    const handleKeyup = (e: KeyboardEvent) => {
      if (e.code === 'KeyA' && panDirectionRef.current === 'left') {
        panDirectionRef.current = null
      }
      if (e.code === 'KeyD' && panDirectionRef.current === 'right') {
        panDirectionRef.current = null
      }
    }

    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('keyup', handleKeyup)
    }
  }, [startGame, toggleFlashlight, handleDoorClose, handleDoorOpen, toggleCams])

  const gameState: GameState = {
    ghostPosition,
    doorClosed,
    flashlightOn,
    panAngle,
    cameraView,
    power,
    timeElapsed,
    gameStatus,
    jumpscare,
  }

  return (
    <div className="game-wrapper">
      <OfficeCanvas
        ghostPosition={ghostPosition}
        doorClosed={doorClosed}
        flashlightOn={flashlightOn}
        panAngle={panAngle}
        cameraView={cameraView}
        jumpscare={jumpscare}
        gameStatus={gameStatus}
      />
      <GameUI
        gameState={gameState}
        currentHour={currentHour}
        onStart={startGame}
        onToggleFlashlight={toggleFlashlight}
        onToggleDoor={() => {
          if (doorClosedRef.current) handleDoorOpen()
          else handleDoorClose()
        }}
        onToggleCams={toggleCams}
        onSetCamView={setCamView}
        onSetPanDirection={setPanDirection}
      />
    </div>
  )
}
