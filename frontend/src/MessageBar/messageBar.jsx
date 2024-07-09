import "./messageBar.css";
const MessageBar = ({ message, setMessage, sendMessage }) => {
    return (
        <div className="msg">
            <input
                className="msg-box"
                type="text"
                placeholder="Type your message"
                value={message.msg}
                name="msg"
                onChange={(e) =>
                    setMessage((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                    }))
                }
            />
            <button className="msg-send" onClick={sendMessage}>
                Send
            </button>
        </div>
    );
};

export default MessageBar;
