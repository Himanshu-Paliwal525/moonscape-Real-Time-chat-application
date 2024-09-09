import { useState, useEffect } from "react";
import { socket } from "../socket";
import "./login.css";
import moonscape from "../Images/moonscape(black).png";

const Login = ({ setMessage, setVisible }) => {
    const [signup, setSignup] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        socket.on("signupSuccess", (token) => {
            localStorage.setItem("token", token);
            setVisible((prev) => !prev);
        });
        socket.on("signupError", (error) => {
            console.log("Error generating the token", error);
        });

        socket.on("loginSuccess", (token) => {
            localStorage.setItem("token", token);
            setVisible((prev) => !prev);
        });
        socket.on("loginError", (error) => {
            console.log("Error generating the token", error);
        });

        return () => {
            socket.off("signupSuccess");
            socket.off("signupError");
            socket.off("loginSuccess");
            socket.off("loginError");
        };
    }, [setVisible]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage((prev) => ({ ...prev, user: formData.username }));

        if (formData.username.trim() === "") {
            alert("Name field can't be empty");
            return;
        }
        if (signup && formData.email.trim() === "") {
            alert("Email field can't be empty for signup");
            return;
        }

        socket.emit("newUser", formData);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setMessage((prev) => ({ ...prev, user: formData.username }));

        if (formData.username.trim() === "" || formData.password.trim() === "") {
            alert("Username and Password are required");
            return;
        }

        socket.emit("login", formData);
    };

    return (
        <div className="login-info">
            <form onSubmit={signup ? handleSubmit : handleLogin}>
                <img src={moonscape} alt="logo" className="moonscape-logo" />
                <input
                    className="login-input"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.username}
                    name="username"
                    required
                    onChange={handleChange}
                />
                {signup && (
                    <input
                        type="email"
                        className="login-input"
                        placeholder="Enter your email"
                        value={formData.email}
                        name="email"
                        required
                        onChange={handleChange}
                    />
                )}
                <input
                    type="password"
                    className="login-input"
                    placeholder="Enter your password"
                    value={formData.password}
                    name="password"
                    required
                    onChange={handleChange}
                />
                <p>
                    {!signup ? "New User? " : "Already have an account? "}
                    <span
                        onClick={() => setSignup((prev) => !prev)}
                        style={{
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "bold",
                            color: "rgb(112, 23, 45)",
                        }}
                    >
                        Click Here
                    </span>
                </p>
                <button type="submit" className="login-btn">
                    {signup ? "Signup" : "Login"}
                </button>
            </form>
        </div>
    );
};

export default Login;
