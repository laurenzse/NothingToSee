"use client";
import YouTubeAudioPlayer from "../components/YouTubeAudioPlayer";
import {useState} from "react";
import LoadingDots from "@/components/LoadingDots";
const SerenePlayer = () =>  {
    const [isVisible, setIsVisible] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoId = "3r_Z5AYJJd4";

    const handleClick = () => {
        setIsVisible(false);
        setIsPlaying(true);
    };

    return (
        <div>
            {isVisible && (
                <button onClick={handleClick}>
                    Click Me
                </button>
            )}
            <LoadingDots/>
            <YouTubeAudioPlayer videoId={videoId} isPlaying={isPlaying}/>
        </div>
    );

}

export default SerenePlayer;
