import React, { useState, useEffect } from "react";
import { socket } from "./socket";
import "./App.css";
import ActiveUsers from "./Active Users/ActiveUser";
import MessageBox from "./MessageBox/MessageBox";
import MessageBar from "./MessageBar/messageBar";
import Login from "./Login/login";
import moonscape from "./Images/moonscape(black).png";

const App = () => {
    const [visible, setVisible] = useState(true);
    const [message, setMessage] = useState({
        user: "",
        msg: "",
        receiver: "",
    });
    const [receiver, setReceiver] = useState(null);
    const [fetchedMessages, setFetchedMessages] = useState([]);
    const [activeUser, setActiveUser] = useState([]);

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
            alert("Please select a receiver before sending a message.");
        }
    };

    return visible ? (
        <Login
            message={message}
            setMessage={setMessage}
            setVisible={setVisible}
        />
    ) : (
        <div>
            <div className="app-header">
                <button
                    className="login-btn logout"
                    onClick={() => {
                        localStorage.removeItem("token");
                        socket.emit("logout");
                        setVisible((prev) => !prev);
                    }}
                >
                    logout
                </button>
                <img
                    src={moonscape}
                    alt="logo"
                    className="moonscape-logo app-logo"
                />
            </div>
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
                    <MessageBar
                        message={message}
                        setMessage={setMessage}
                        sendMessage={sendMessage}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
