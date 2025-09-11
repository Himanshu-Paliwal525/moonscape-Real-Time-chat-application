import { createContext, useContext, useState, useRef } from "react";

const AudioContext = createContext(undefined);

export const AudioProvider = ({ children }) => {
    const [currAudio, setCurrAudio] = useState(0);
    const audioRef = useRef(new Audio());

    return (
        <AudioContext.Provider
            value={{
                currAudio,
                setCurrAudio,
                audioRef,
            }}
        >
            {children}
        </AudioContext.Provider>
    );
};

export const useAudioContext = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error("useAudioContext must be used within an AudioProvider");
    }
    return context;
};
