import { useEffect, useState } from 'react'
import send from '../assets/send.svg'
import { MediaRecorderCreation } from './MediaRecorderUtils'
import VoiceMessagingBox from './voiceRecording'

const MessageBar = ({ message, receiver, setMessage, sendMessage }) => {
  useEffect(() => {
    MediaRecorderCreation()
  }, [])
  const [voiceMessage, setVoiceMessage] = useState(false)
  const [rows, setRows] = useState(1)
  const handleEnterPress = (e) => {
    if (e.key === 'Enter') {
      if (e.ctrlKey || e.shiftKey) {
        e.preventDefault()
        const cursorPosition = e.target.selectionStart
        const newMessage =
          message.msg.slice(0, cursorPosition) + '\n' + message.msg.slice(cursorPosition)
        setMessage((prev) => ({ ...prev, msg: newMessage }))
        setRows((prev) => prev + 1)
      } else {
        e.preventDefault()
        sendMessage()
        setRows(1)
      }
    } else if (e.key === 'Backspace') {
      const cursorPosition = e.target.selectionStart
      const textBeforeCursor = e.target.value.slice(0, cursorPosition)
      if (cursorPosition === 0 || textBeforeCursor.endsWith('\n')) {
        setRows((prev) => Math.max(1, prev - 1))
      }
    }
  }
  return (
    receiver && (
      <div className={`p-[7px] w-full shadow-[0_0_4px_black] flex z-20`}>
        <VoiceMessagingBox
          voiceMessage={voiceMessage}
          setVoiceMessage={setVoiceMessage}
          user={message.user}
          receiver={receiver}
        />

        {!voiceMessage && (
          <textarea
            className=" border-gray-600 shadow-[0_0_2px_black] outline-none flex-1 mx-1 px-[10px] py-2 rounded-[8px] text-[14px] resize-none scrollbar-none"
            placeholder="Type your message"
            rows={Math.min(4, rows)}
            value={message.msg}
            name="msg"
            onKeyDown={handleEnterPress}
            onChange={(e) =>
              setMessage((prev) => ({
                ...prev,
                [e.target.name]: e.target.value
              }))
            }
          />
        )}
        {!voiceMessage && (
          <button
            className="text-white rounded-[10px] flex justify-center items-center shadow-[0_0_1px_black] px-2 py-2 border-none cursor-pointer bg-slate-900 hover:bg-slate-950"
            onClick={sendMessage}
          >
            <img src={send} alt="" className="invert h-[20px]" />
          </button>
        )}
      </div>
    )
  )
}

export default MessageBar
