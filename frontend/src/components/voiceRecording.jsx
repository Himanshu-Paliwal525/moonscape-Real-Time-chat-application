import { useState, useRef, useEffect, useCallback } from 'react'
import {
  PauseAudio,
  PlayRecording,
  sendVoiceMessage,
  startRecording,
  stopRecording
} from './MediaRecorderUtils'
import stop from '../assets/stop.svg'
import voice from '../assets/voice.svg'
import play from '../assets/play.svg'
import pause from '../assets/pause.svg'
import send from '../assets/send.svg'
import anotherRecord from '../assets/anotherRecord.svg'
import cancel from '../assets/close.svg'
import '../Styles/style.css'

const VoiceMessagingBox = ({ voiceMessage, setVoiceMessage, user, receiver }) => {
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const dataArrayRef = useRef(null)
  const animationFrameIdRef = useRef(null)
  const streamRef = useRef(null)
  const timerIdRef = useRef(null)
  const [time, setTime] = useState(0)
  const [buffer, setBuffer] = useState([])
  const [visual, setVisual] = useState(false)
  const [currPosition, setCurrPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [recordingStopped, setRecordingStopped] = useState(false)
  
  const startAudioVisualizer = async () => {
    startRecording()
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })
    streamRef.current = stream

    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    audioContextRef.current = audioContext

    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 32

    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyserRef.current = analyser
    dataArrayRef.current = dataArray

    source.connect(analyser)

    startTimer()
    Draw()
    setVoiceMessage(true)
    setVisual(true)
  }
  
  const AnotherRecord = () => {
    setTime(duration)
    setRecordingStopped(false)
    startAudioVisualizer()
  }

  const stopAudioVisualizer = (audioCancel) => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current)
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    stopRecording(audioCancel)
    stopTimer()
    setDuration(time)
    setVisual(false)
    setCurrPosition(0)
    setPlaying(false)
    setBuffer([])
    setRecordingStopped(true)
  }
  
  const lastUpdateTimeRef = useRef(Date.now())
  
  const Draw = () => {
    animationFrameIdRef.current = requestAnimationFrame(Draw)
    const now = Date.now()
    const elapsed = now - lastUpdateTimeRef.current

    if (elapsed < 100) return

    lastUpdateTimeRef.current = now
    const analyser = analyserRef.current
    const dataArray = dataArrayRef.current

    if (analyser && dataArray) {
      analyser.getByteTimeDomainData(dataArray)
      const volume =
        dataArray.reduce((sum, value) => sum + Math.abs(value - 128), 0) / dataArray.length

      setBuffer((prev) => {
        const newPrev = [...prev, volume]
        if (newPrev.length > 20) {
          newPrev.shift()
        }
        return newPrev
      })
    }
  }
  
  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0)
    return `${minutes}:${parseInt(seconds) < 10 ? '0' : ''}${seconds}`
  }
  
  const startTimer = () => {
    if (timerIdRef.current === null) {
      timerIdRef.current = window.setInterval(() => {
        setTime((prev) => prev + 100)
      }, 100)
    }
  }
  
  const stopTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current)
      timerIdRef.current = null
    }
  }, [])
  
  useEffect(() => {
    if (currPosition >= 100) {
      stopTimer()
      setPlaying(false)
      setCurrPosition(0)
    } else if (playing) {
      setCurrPosition((time / duration) * 100)
    }
  }, [duration, playing, time, stopTimer, currPosition])
  
  const cancelRecording = () => {
    setVoiceMessage(false)
    setTime(0)
    setDuration(0)
    stopAudioVisualizer(true)
    setRecordingStopped(false)
  }
  
  return (
    <div className="flex gap-10">
      <div className="flex items-center bg-slate-900 rounded-lg shadow-[0_0_1px_black]">
        {!voiceMessage && (
          <button onClick={startAudioVisualizer}>
            <img
              src={voice}
              alt=""
              className="h-8 invert px-1"
              onClick={() => setVoiceMessage(true)}
            />
          </button>
        )}
        {voiceMessage && (
          <div className="flex items-center py-1">
            <button onClick={cancelRecording}>
              <img src={cancel} alt="" className="h-4 mx-3 invert" />
            </button>
            <span className="mx-1 text-white text-sm flex justify-center w-10">
              {formatTime(time)}
            </span>
            <div className="w-32 mx-4 flex h-7 justify-between items-center">
              {visual ? (
                buffer.map((value, index) => (
                  <div
                    key={index}
                    className="w-[3px] mx-[1px] bg-sky-300 rounded-md"
                    style={{
                      height: `${Math.min(25, value)}px`
                    }}
                  />
                ))
              ) : (
                <input
                  type="range"
                  step={0.1}
                  value={currPosition}
                  className="bg-slate-900 appearance-none audio-track"
                  onChange={(e) => {
                    setCurrPosition(Number(e.target.value))
                    setTime(Math.round((Number(e.target.value) / 100) * duration))
                    if (playing) {
                      PauseAudio()
                      PlayRecording(Number(e.target.value), duration)
                    }
                  }}
                />
              )}
            </div>
            {!recordingStopped ? (
              <button onClick={() => stopAudioVisualizer(false)}>
                <img src={stop} alt="" className="h-6" />
              </button>
            ) : (
              <div className="flex gap-2">
                {!playing ? (
                  <button
                    onClick={() => {
                      setPlaying(true)
                      PlayRecording(currPosition, duration)
                    }}
                  >
                    <img src={play} alt="" className="h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setPlaying(false)
                      PauseAudio()
                    }}
                  >
                    <img src={pause} alt="" className="h-5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    AnotherRecord()
                  }}
                >
                  <img src={anotherRecord} alt="" className="h-5" />
                </button>
                <button
                  onClick={() => {
                    sendVoiceMessage(user, receiver)
                    setVoiceMessage(false)
                    setTime(0)
                    setDuration(0)
                    setRecordingStopped(false)
                  }}
                >
                  <img src={send} alt="" className="h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VoiceMessagingBox
