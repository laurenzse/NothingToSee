"use client";
import YouTubeAudioPlayer from "./YouTubeAudioPlayer";
import React, { useState, useEffect, useCallback } from "react";
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

  const onReady = useCallback(() => {
    setIsLoading(false);
  }, []);

  const onWaiting = useCallback(() => {
    setIsLoading(true);
  }, []);

  const onResumedPlaying = useCallback(() => {
    setIsLoading(false);
  }, []);

  const onPlay = useCallback(() => {
    // Media state can be set from outside (e.g., by media keys)
    setIsPlaying(true);
  }, []);

  const onPause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const chooseNewYouTubeURL = useCallback(async () => {
    try {
      const newURL = await getSoundscapeLink();
      sourceURLChanged(newURL);
      setYouTubeURL(newURL);
    } catch (error) {
      console.error("Failed to fetch YouTube video:", error);
    }
  }, [sourceURLChanged]);

  const onEnded = useCallback(() => {
    chooseNewYouTubeURL();
  }, [chooseNewYouTubeURL]);

  const handleClick = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Load initial soundscape on mount
  useEffect(() => {
    chooseNewYouTubeURL();
  }, [chooseNewYouTubeURL]);

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
