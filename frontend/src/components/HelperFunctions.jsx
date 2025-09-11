
const ConvertVoiceMessageToBlob = (voiceMessage) => {
  if (!voiceMessage.data || typeof voiceMessage.data !== 'string') {
    console.error('Invalid data: Voice message data is either null or not a string.')
    return null
  }

  try {
    // Decode Base64
    const byteCharacters = atob(voiceMessage.data)
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i))

    const byteArray = new Uint8Array(byteNumbers)
    // Create a Blob
    return new Blob([byteArray], {
      type: voiceMessage.mimeType || 'audio/ogg'
    })
  } catch (error) {
    console.error('Failed to decode Base64 string:', error)
    return null
  }
}

export const groupMessages = (messages) => {
  // Handle empty input
  if (!messages || messages.length === 0) return []

  const grouped = []

  let temp = []

  let currentUser = messages[0]?.user
  let lastDate = new Date(messages[0]?.timestamp).toDateString()

  messages.forEach((msg, i) => {
    if (msg.voiceMessage?.data && typeof msg.voiceMessage?.data === 'string') {
      const audioBlob = ConvertVoiceMessageToBlob(msg.voiceMessage)
      msg.voiceMessage = {
        ...msg.voiceMessage,
        data: audioBlob instanceof Blob ? audioBlob : null
      }
    }
    const currentDate = new Date(msg.timestamp).toDateString()

    if (msg.notification || (msg.user === currentUser && currentDate === lastDate)) {
      temp.push({
        message: msg.message,
        timestamp: msg.timestamp,
        notification: msg.notification,
        voiceMessage: msg.voiceMessage
      })
    } else {
      grouped.push({ user: currentUser, messages: temp })

      currentUser = msg.user
      lastDate = currentDate
      temp = [
        {
          message: msg.message,
          timestamp: msg.timestamp,
          notification: msg.notification,
          voiceMessage: msg.voiceMessage
        }
      ]
    }

    // Always add the last group
    if (i === messages.length - 1) {
      grouped.push({ user: currentUser, messages: temp })
    }
  })

  // Handle grouped merging
  if (grouped.length === 0) return []
  const merged = []
  let prev = grouped[0]

  for (let i = 1; i < grouped.length; i++) {
    const curr = grouped[i]

    if (
      prev.user === curr.user &&
      new Date(prev.messages[0].timestamp).toDateString() ===
        new Date(curr.messages[0].timestamp).toDateString()
    ) {
      prev = {
        ...prev,
        messages: [...prev.messages, ...curr.messages]
      }
    } else {
      merged.push(prev)
      prev = curr
    }
  }

  merged.push(prev)
  return merged
}

export const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  if (now.getFullYear() !== date.getFullYear()) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
  } else if (now.getTime() - date.getTime() > 7 * 24 * 60 * 60 * 1000) {
    return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
  } else {
    if (now.getDay() - date.getDay() === 1) return 'Yesterday'
    else if (now.getDay() - date.getDay() === 0) return 'Today'
    else return weekDays[date.getDay()]
  }
}
