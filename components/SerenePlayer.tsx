"use client";
import Image from "next/image";
import YouTubeAudioPlayer from "../components/youtube_audio_player";
import { useState, useEffect } from "react";
import LoadingDots from "@/components/LoadingDots";
import { getSoundscapeLink } from "../lib/soundscapes";
import { getYouTubeIdFromURL } from "../lib/youtube_utils";
import MuteIcon from "../public/mute_icon.svg";
import "../styles/split-layout.css";
import "../styles/global.css";

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
    // TODO handle set playing correctly when media is loading
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

    return () => {};
  }, []);

  return (
    <div className="split-layout">
      <div className="section upper-section">
        {!isPlaying && (
          <div className="centered-element">
            <Image
              src={MuteIcon}
              alt="Mute"
              className="mute-icon"
              height={75}
              width={75}
            />
          </div>
        )}
      </div>
      <div className="section lower-section">
        {isLoading && (
          <div className="centered-element">
            <LoadingDots />
          </div>
        )}
      </div>
      {youTubeId && (
        <YouTubeAudioPlayer
          videoId={youTubeId}
          onReady={onReady}
          onWaiting={onWaiting}
          onResumed={onResumedPlaying}
          startAt={3}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
};

export default SerenePlayer;
