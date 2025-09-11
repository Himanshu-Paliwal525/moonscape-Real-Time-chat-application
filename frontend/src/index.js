import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { AudioProvider } from "./context/AudioContext.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <AudioProvider>
            <App />
        </AudioProvider>
    </React.StrictMode>
);
