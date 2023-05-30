"use client";
import YouTubeAudioPlayer from "../components/YouTubeAudioPlayer";
import { useState, useEffect } from "react";
import LoadingDots from "@/components/LoadingDots";
import { getSoundscapeLink } from "../lib/soundscapes";
import { getYouTubeIdFromURL } from "../lib/youtube_utils";

const SerenePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [youTubeId, setYouTubeId] = useState<string>();

  const onReady = () => {
    setIsLoading(false);
  };

  const onWaiting = () => {
    setIsLoading(true);
  };

  const onResumedPlaying = () => {
    setIsLoading(false);
  };

  const handleClick = (event: MouseEvent) => {
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    // Attach the click event listener to the document during the capture phase
    // to handle the click event only if it has not been processed by other components
    document.addEventListener("click", handleClick, { capture: true });

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  });

  useEffect(() => {
    const setYouTubeURL = async () => {
      try {
        const youtube_url = await getSoundscapeLink();
        const youtube_id = getYouTubeIdFromURL(youtube_url);
        setYouTubeId(youtube_id);
      } catch (error) {
        console.error("Failed to fetch YouTube video data:", error);
      }
    };

    setYouTubeURL();
  });

  return (
    <div>
      {!isPlaying && "Muted"}
      {isLoading && <LoadingDots />}
      {youTubeId && (
        <YouTubeAudioPlayer
          videoId={youTubeId}
          onReady={onReady}
          onWaiting={onWaiting}
          onResumed={onResumedPlaying}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
};

export default SerenePlayer;
