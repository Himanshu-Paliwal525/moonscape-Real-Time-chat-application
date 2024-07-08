import { useEffect } from "react";
import { socket } from "../socket";

const MessageBox = ({
    fetchedMessages,
    setFetchedMessages,
    message,
    receiver,
}) => {
    const getMsgStyle = (user) => {
        if (message.user !== user) {
            return {
                background: "rgb(112,23,45)",
            };
        }
        return {};
    };
    useEffect(() => {
        if (receiver != null) {
            const handleSendMessage = ({ sender, recepient, allMessages }) => {
                setFetchedMessages(allMessages);
            };

            const handleSend = ({ all, recepient }) => {
                if (receiver === all[all.length - 1].user) {
                    setFetchedMessages(all);
                }
            };

            socket.on("sendMessage", handleSendMessage);
            socket.on("send", handleSend);

            return () => {
                socket.off("sendMessage", handleSendMessage);
                socket.off("send", handleSend);
            };
        }
    }, [message.user, setFetchedMessages, receiver]);
    function convertTimestampTo24Hour(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, "0"); // Get hours in 24-hour format
        const minutes = date.getMinutes().toString().padStart(2, "0"); // Get minutes
        return `${hours}:${minutes}`;
    }

    return (
        <div className="msg-container">
            {fetchedMessages
                ? fetchedMessages.map((msg, index) => (
                      <div
                          key={index}
                          className="msg-fetch"
                          style={
                              message.user === msg.user
                                  ? { justifyContent: "flex-end" }
                                  : { justifyContent: "flex-start" }
                          }
                      >
                          <div
                              className="msg-show"
                              style={getMsgStyle(msg.user)}
                          >
                              {" "}
                              <span className="msg-msg">{msg.message}</span>
                              <span className="msg-timestamp">
                                  {convertTimestampTo24Hour(msg.timestamp)}{" "}
                              </span>
                          </div>
                      </div>
                  ))
                : null}
        </div>
    );
};

export default MessageBox;
