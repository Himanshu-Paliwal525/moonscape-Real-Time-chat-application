import { useState } from "react";
import { socket } from "../socket";
import "./login.css";
import moonscape from '../Images/moonscape(black).png'
const Login = ({ message, setMessage, setVisible }) => {
    const [loginStyle, setLoginStyle] = useState({});
    const handleClick = () => {
        if (message.user.trim() !== "") {
            socket.emit("newUser", message.user);
        }
        setLoginStyle((prev) => ({ ...prev, display: "none" }));
        setVisible((prev) => ({ ...prev, display: "inline" }));
    };
    return (
        <div className="login-info" style={loginStyle}>
            <div>
            <img
                        src={moonscape}
                        alt="logo"
                        className="moonscape-logo"
                    />
                <input
                    className="login-input"
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
                <input
                    type="email"
                    className="login-input"
                    placeholder="Enter your email"
                />
                <input
                    type="password"
                    className="login-input"
                    placeholder="Enter your password"
                />
                <button
                    type="button"
                    className="login-btn"
                    onClick={handleClick}
                >
                    Login
                </button>
            </div>
        </div>
    );
};

export default Login;
