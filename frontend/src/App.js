import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import "./App.css";
import ActiveUsers from "./Active Users/ActiveUser";
import MessageBox from "./message box/MessageBox";

const App = () => {
    const [message, setMessage] = useState({
        user: "",
        msg: "",
        receiver: "",
    });
    const [receiver, setReceiver] = useState(null);
    const [fetchedMessages, setFetchedMessages] = useState([]);
    const [activeUser, setActiveUser] = useState([]);

    const handleClick = () => {
        if (message.user.trim() !== "") {
            socket.emit("newUser", message.user);
        }
    };

    useEffect(() => {
        const handleNewActiveUser = (allActiveUsers) => {
            setActiveUser(
                Object.values(allActiveUsers).filter(
                    (value) => value !== message.user
                )
            );
        };

        socket.on("newActiveUser", handleNewActiveUser);

        return () => {
            socket.off("newActiveUser", handleNewActiveUser);
        };
    }, [message.user]);

    useEffect(() => {
        const handleFetchMessages = (messages) => {
            setFetchedMessages(messages);
        };

        socket.on("fetchMessages", handleFetchMessages);

        return () => {
            socket.off("fetchMessages", handleFetchMessages);
        };
    }, []);

    const sendMessage = () => {
        if (message.msg.trim() !== "" && receiver) {
            const date = new Date();
            const time = `${date.getHours()}:${date.getMinutes()}`;
            const timestamp = date.getTime();
            socket.emit("ownMessage", { message, time, timestamp });
            setMessage((prev) => ({ ...prev, msg: "" }));
        } else {
            // Optionally handle case where no receiver is selected
            console.log("Please select a receiver before sending a message.");
        }
    };
    

    return (
        <div>
            <div className="info">
                <input
                    type="text"
                    placeholder="Enter your name"
                    value={message.user}
                    name="user"
                    onChange={(e) => {
                        setMessage((prev) => ({
                            ...prev,
                            [e.target.name]: e.target.value,
                        }));
                    }}
                />
                <button type="button" onClick={handleClick}>
                    Submit
                </button>
            </div>
            <h1>Chat Application</h1>
            <h2>{message.user}</h2>
            <div className="home">
                <ActiveUsers
                    setMessage={setMessage}
                    activeUser={activeUser}
                    setReceiver={setReceiver}
                    user={message.user}
                />
                <div className="chatroom">
                    <div className="chat-display">
                        <span className="receiver-name">
                            {receiver ? receiver : "no-one"}
                        </span>
                        <MessageBox
                            fetchedMessages={fetchedMessages}
                            setFetchedMessages={setFetchedMessages}
                            message={message}
                            receiver={receiver}
                        />
                    </div>
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
                </div>
            </div>
        </div>
    );
};

export default App;
