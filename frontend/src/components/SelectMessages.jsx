import select from '../assets/select.svg'
import VoiceMessage from './VoiceMessage'

const SelectedMessages = ({
  index,
  msg,
  messageUser,
  groupUser,
  selection,
  selected,
  handleSelectionChange
}) => {
  const getMsgStyle = (user) => {
    return messageUser !== user ? { background: '#0879a2' } : {}
  }
  return (
    <>
      {msg.notification && (
        <div className="w-full flex justify-center mb-4 mt-2">
          <span className="bg-red-900 text-white text-[13px] font-nunito px-3 py-[2px] rounded-[4px] shadow-[0_0_1px_black] cursor-default select-none">
            {msg.message}
          </span>
        </div>
      )}
      {!msg.notification && (
        <div
          className={`flex items-center ${messageUser === groupUser ? 'justify-end' : ''} ${
            messageUser === groupUser && selection ? 'justify-between' : ''
          } ${selection ? ' select-none' : ''} ${
            selection
              ? selected.find((c) => c === msg.timestamp)
                ? 'bg-[rgba(112,161,245,0.4)] hover:bg-[rgba(112,161,245,0.4)]'
                : 'hover:bg-[rgba(49,78,110,0.4)]'
              : ''
          }
                ${index === 0 ? 'pt-3' : ''} w-full py-[1px]`}
          onClick={() => selection && handleSelectionChange(msg.timestamp)}
        >
          {selection && (
            <span
              className={`rounded-[5px] ml-12 ${
                selected.find((c) => c === msg.timestamp) ? 'bg-red-900 opacity-80' : 'bg-white'
              } shadow-[0_0_1px_black] px-1 py-1`}
            >
              <img src={select} alt="" className="h-4" />
            </span>
          )}
          <div className={`flex items-start ${selection ? 'pointer-events-none' : ''}`}>
            {index === 0 && messageUser !== groupUser && (
              <span className="border-4 ml-2  border-transparent border-t-[#0879a2] border-r-[#0879a2]"></span>
            )}
            <div
              className={`flex items-end ${
                index === 0 && messageUser !== groupUser ? 'rounded-tl-none mx-0' : 'ml-4'
              } ${
                messageUser === groupUser && index === 0 ? 'rounded-tr-none mx-0' : 'mr-2'
              } bg-slate-900 rounded-[8px] gap-[10px] px-[10px] py-[6px] z-50 max-w-[500px]`}
              style={getMsgStyle(groupUser)}
            >
              {!msg.voiceMessage ? (
                <span className="text-white text-[12px] whitespace-pre-wrap">{msg.message}</span>
              ) : (
                <VoiceMessage msg={msg} groupUser={groupUser} messageUser={messageUser} />
              )}
              <span className="text-[10px] text-right w-[70px] text-gray-300">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {index === 0 && messageUser === groupUser && (
              <span className="border-4 border-transparent border-t-slate-900 border-l-slate-900"></span>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default SelectedMessages
