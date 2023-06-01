"use client";
import Image from "next/image";
import YouTubeAudioPlayer from "../components/youtube_audio_player";
import { useState, useEffect } from "react";
import LoadingDots from "@/components/LoadingDots";
import { getSoundscapeLink } from "../lib/soundscapes";
import MuteIcon from "../components/mute_icon";
import "../styles/split-layout.css";
import "../styles/global.css";

const SerenePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [youTubeURL, setYouTubeURL] = useState<string>();

  const onReady = () => {
    setIsLoading(false);
  };

  const onWaiting = () => {
    setIsLoading(true);
  };

  const onResumedPlaying = () => {
    setIsLoading(false);
  };

  const onPlay = () => {
    // if media is state is set from outside, e.g. by media keys, update UI and state accordingly
    setIsPlaying(true);
  };

  const onPause = () => {
    setIsPlaying(false);
  };

  const onEnded = () => {
    (async () => {
      try {
        await chooseNewYouTubeURL();
      } catch (error) {
        console.error("Failed to choose YouTube video:", error);
      }
    })();
  };

  const handleClick = (event: MouseEvent) => {
    setIsPlaying(!isPlaying);
  };

  const chooseNewYouTubeURL = async () => {
    try {
      const youTubeURL = await getSoundscapeLink();
      setYouTubeURL(youTubeURL);
    } catch (error) {
      console.error("Failed to fetch YouTube video data:", error);
    }
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
    chooseNewYouTubeURL();

    return () => {};
  }, []);

  return (
    <div className="split-layout fill-container">
      <div className="section lowered-element">
        {!isPlaying && (
          <div className="centered-element">
            <MuteIcon className="mute-icon" />
          </div>
        )}
      </div>
      <div className="section raised-element">
        {isLoading && (
          <div className="centered-element">
            <LoadingDots />
          </div>
        )}
      </div>
      {youTubeURL && (
        <YouTubeAudioPlayer
          youtubeURL={youTubeURL}
          onReady={onReady}
          onWaiting={onWaiting}
          onResumed={onResumedPlaying}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          startAt={3}
          isPlaying={isPlaying}
        />
      )}
    </div>
  );
};

export default SerenePlayer;
