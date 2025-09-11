import { useState, useEffect, useRef } from 'react'
import { socket } from '../socket'
import ActiveUsers from './ActiveUsers'
import MessageBox from './MessageBox'
import MessageBar from './messageBar'
import Login from './login'
import delete_icon from '../assets/delete.svg'
import select from '../assets/select.svg'
import cancel from '../assets/cancel.svg'

const Homepage = () => {
  const [visible, setVisible] = useState(true)
  const [message, setMessage] = useState({
    user: '',
    msg: '',
    receiver: ''
  })
  const [selected, setSelected] = useState([])
  const [receiver, setReceiver] = useState('')
  const [fetchedMessages, setFetchedMessages] = useState([])
  const [activeUser, setActiveUser] = useState([])
  const chatRef = useRef(null)
  const [selection, setSelection] = useState(false)
  useEffect(() => {
    const handleNewActiveUser = (allActiveUsers) => {
      setActiveUser(Object.values(allActiveUsers).filter((value) => value !== message.user))
    }

    socket.on('newActiveUser', handleNewActiveUser)

    return () => {
      socket.off('newActiveUser', handleNewActiveUser)
    }
  }, [message.user])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
    const handleFetchMessages = (messages) => {
      setFetchedMessages(messages)
    }
    socket.on('fetchMessages', handleFetchMessages)
    return () => {
      socket.off('fetchMessages', handleFetchMessages)
    }
  }, [fetchedMessages])

  const sendMessage = () => {
    if (message.msg.trim() !== '' && receiver) {
      const date = new Date()
      const time = `${date.getHours()}:${date.getMinutes()}`
      const timestamp = date.getTime()
      socket.emit('ownMessage', { message, time, timestamp })
      setMessage((prev) => ({ ...prev, msg: '' }))
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight
      }
    } else {
      alert('Please select a receiver before sending a message.')
    }
  }
  const handleDeletion = () => {
    socket.emit('DeleteSelectedMessages', {
      selected,
      user1: message.user,
      user2: receiver
    })
    setSelection(false)
  }
  return visible ? (
    <Login setMessage={setMessage} setVisible={setVisible} />
  ) : (
    <div className="pt-[40px] h-screen">
      {/* <button
                    className="bg-red-900 border-none text-white rounded-md mt-3 px-5 py-[5px] absolute right-10 top-14"
                    onClick={() => {
                        localStorage.removeItem("token");
                        socket.emit("logout");
                        setVisible((prev) => !prev);
                        setReceiver("");
                        setFetchedMessages([]);
                    }}
                >
                    logout
                </button> */}

      <div className="flex h-full">
        <div className="flex flex-col">
          <ActiveUsers
            setMessage={setMessage}
            activeUser={activeUser}
            curr_receiver={receiver}
            setReceiver={setReceiver}
            user={message.user}
          />
        </div>
        <div className="flex flex-1 flex-col items-end justify-end ">
          <div className="flex flex-col w-full overflow-auto flex-1">
            <div className="flex justify-between px-5 text-white bg-slate-900 shadow-[0_0.5px_0.5px_black] z-20 h-[67px] items-center rounded-tr-[15px] text-[18px] font-semibold font-nunito">
              {receiver ? <>{receiver}</> : 'no-one'}
              <div className="flex items-center mr-10">
                {selection && (
                  <img
                    src={delete_icon}
                    alt=""
                    className="h-[40px] hover:bg-slate-700 hover:opacity-90 px-2 py-2 rounded-xl"
                    onClick={handleDeletion}
                  />
                )}
                {selection ? (
                  <img
                    src={cancel}
                    alt=""
                    className="h-[41px] hover:bg-slate-700 hover:opacity-90 px-1 py-1 rounded-xl"
                    onClick={() => {
                      setSelection(false)
                      setSelected([])
                    }}
                  />
                ) : (
                  <img
                    src={select}
                    alt=""
                    className="h-[40px] hover:bg-slate-700 hover:opacity-90 px-2 py-2 rounded-xl"
                    onClick={() => setSelection(true)}
                  />
                )}
              </div>
            </div>
            <MessageBox
              fetchedMessages={fetchedMessages}
              setFetchedMessages={setFetchedMessages}
              message={message}
              receiver={receiver}
              chatRef={chatRef}
              selection={selection}
              selected={selected}
              setSelected={setSelected}
            />
          </div>
          <MessageBar
            message={message}
            receiver={receiver}
            setMessage={setMessage}
            sendMessage={sendMessage}
          />
        </div>
      </div>
    </div>
  )
}

export default Homepage
