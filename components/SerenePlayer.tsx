"use client";
import YouTubeAudioPlayer from "../components/YouTubeAudioPlayer";
import {useState, useEffect} from "react";
import LoadingDots from "@/components/LoadingDots";
const SerenePlayer = () =>  {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const videoId = "3r_Z5AYJJd4";

    const onReady = () => {
        setIsLoading(false);
    }

    const onWaiting = () => {
        setIsLoading(true);
    }

    const onResumedPlaying = () => {
        setIsLoading(false);
    }

    const handleClick = (event: MouseEvent) => {
        // Handle the click event only if it has not been processed by other components
        setIsPlaying(!isPlaying);
        console.log('Clicked anywhere on the screen');
    };

    useEffect(() => {
        // Attach the click event listener to the document during the capture phase
        document.addEventListener('click', handleClick, { capture: true });

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener('click', handleClick, { capture: true });
        };
    });

    return (
        <div>
            {!isPlaying && ("Muted")}
            {isLoading && (
                <LoadingDots/>
            )}
            <YouTubeAudioPlayer videoId={videoId}  onReady={onReady} onWaiting={onWaiting} onResumed={onResumedPlaying} isPlaying={isPlaying}/>
        </div>
    );

}

export default SerenePlayer;
