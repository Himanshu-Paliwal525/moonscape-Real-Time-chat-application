import { socket } from '../socket'

let audioChunks = []
let mediaRecorder = null
let audioBlob = null
let audio = null

export const MediaRecorderCreation = async () => {
  if (!navigator.mediaDevices) {
    console.error("MediaDevices API not available in this environment")
    return
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  mediaRecorder = new MediaRecorder(stream)

  mediaRecorder.ondataavailable = (event) => {
    audioChunks.push(event.data)
  }

  mediaRecorder.onstart = () => {
    console.log('Recording has started')
  }

  mediaRecorder.onstop = () => {
    console.log('Recording has stopped')
    audioBlob = new Blob(audioChunks, { type: 'audio/ogg' })
    console.log('recorded audio blob: ', audioBlob)
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      console.log('audio URL is: ', audioUrl)
      audio = new Audio(audioUrl)
    } else {
      console.log('No recording available to play')
    }
    audioChunks = [] // clear after stop
  }

  mediaRecorder.onerror = (error) => {
    console.error('Recording error', error)
  }

  console.log('Media recorder instance created')
}

export const startRecording = () => {
  if (mediaRecorder && mediaRecorder.state === 'inactive') {
    mediaRecorder.start()
  }
}

export const stopRecording = (audioCancelled) => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  if (audioCancelled) {
    audioBlob = null
    audioChunks = []
    console.log('audio is cancelled')
  }
}

export const PlayRecording = (position, duration) => {
  if (!audio) {
    console.error("No audio available to play")
    return
  }
  audio.currentTime = (position * duration) / 1000 / 100
  audio.play()
}

export const PauseAudio = () => {
  if (audio) audio.pause()
}

export const sendVoiceMessage = (user, receiver, duration) => {
  if (!audioBlob) {
    console.error("No audio to send")
    return
  }

  const reader = new FileReader()
  reader.onloadend = () => {
    const result = reader.result
    if (result && typeof result === 'string') {
      const base64Audio = result.split(',')[1]
      socket.emit('sendVoiceMessage', { user, receiver, audio: base64Audio, duration })
    } else {
      console.error('Failed to read audio data as Base64 string')
    }
  }
  reader.readAsDataURL(audioBlob)
}

export const tempPlay = (audioBlob) => {
  try {
    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob)
      const tempAudio = new Audio(audioUrl)
      tempAudio.play()
    }
  } catch (error) {
    console.error('Error playing audio: ', error)
  }
}
