"use client";
import YouTubeAudioPlayer from "./YouTubeAudioPlayer";
import React, { useState, useEffect } from "react";
import LoadingDots from "@/components/LoadingDots";
import { getSoundscapeLink } from "@/lib/soundscapes";
import MuteIcon from "./MuteIcon";
import styles from "../styles/MinimalPlayer.module.css";

interface MinimalPlayerProps {
  sourceURLChanged: (url: string) => void;
}

const MinimalPlayer: React.FC<MinimalPlayerProps> = ({ sourceURLChanged }) => {
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
    console.log("set play");
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  const onPause = () => {
    console.log("set pause");
    if (isPlaying) {
      setIsPlaying(false);
    }
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

  const handleClick = () => {
    setIsPlaying(!isPlaying);
  };

  const chooseNewYouTubeURL = async () => {
    try {
      const youTubeURL = await getSoundscapeLink();
      sourceURLChanged(youTubeURL);
      setYouTubeURL(youTubeURL);
    } catch (error) {
      console.error("Failed to fetch YouTube video data:", error);
    }
  };

  useEffect(() => {
    chooseNewYouTubeURL();

    return () => {};
  }, []);

  return (
    <div className="split-layout fill-container" onClick={handleClick}>
      <div className={`${styles.section} ${styles.loweredElement}`}>
        {!isPlaying && (
          <div className={`${styles.centeredElement}`}>
            <MuteIcon className={`${styles.muteIcon}`} />
          </div>
        )}
      </div>
      <div className={`${styles.section} ${styles.raisedElement}`}>
        {isLoading && (
          <div className={`${styles.centeredElement}`}>
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

export default MinimalPlayer;
