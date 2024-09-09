import React from "react";
import "./ActiveUsers.css";
import { socket } from "../socket";

const ActiveUsers = ({ setReceiver, setMessage, activeUser, user }) => {
    const handleClick = (receiver) => {
        setMessage((prev) => ({ ...prev, receiver }));
        socket.emit("setReceiver", { user, receiver });
        setReceiver(receiver);
    };

    return (
        <div className="active-users">
            <h3 style={{textAlign: 'center'}}>Active Users</h3>
            <div className="active-list">
                {activeUser.map((receiver) => (
                    <div
                        key={receiver}
                        className="active-name"
                        onClick={() => handleClick(receiver)}
                    >
                        <span className="active-receiver">{receiver}</span>
                        <span className="active-status">status: Whatever happens happens with truth</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveUsers;
