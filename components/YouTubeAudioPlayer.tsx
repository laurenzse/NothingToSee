import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "videojs-youtube";
import "video.js/dist/video-js.css";

type Props = {
  youtubeUrl: string;
  startTime: number;
  onLoading: (isLoading: boolean) => void;
  onPlaying: (isPlaying: boolean) => void;
  onEnded: () => void;
  isPlaying: boolean;
};

const YouTubeAudioPlayer: React.FC<Props> = ({
  youtubeUrl,
  startTime,
  onLoading,
  onPlaying,
  onEnded,
  isPlaying,
}) => {
  const audioRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const audioElement = document.createElement("audio");
      audioElement.classList.add("video-js");
      audioElement.classList.add("hidden");

      if (audioRef.current) {
        audioRef.current.appendChild(audioElement);
      }

      // Configure Video.js player options
      const options = {
        autoplay: false,
        controls: false,
        preload: "auto",
        techOrder: ["youtube"],
        sources: [{ src: youtubeUrl, type: "video/youtube" }],
        youtube: {
          ytControls: false,
        },
      };

      // Create Video.js player instance
      const player = videojs(audioElement, options, () => {
        player.src([{ src: youtubeUrl, type: "video/youtube" }]);
        player.currentTime(startTime);
        player.muted(true);
        player.play();
        onPlaying(true);
      });

      // Handle player events
      player.on("loadstart", () => onLoading(true));
      player.on("loadedmetadata", () => onLoading(false));
      player.on("ended", () => {
        onEnded();
        player.dispose();
      });

      // Store the player reference
      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        // Cleanup on unmount
        playerRef.current.dispose();
      }
    };
  }, [youtubeUrl, startTime, onLoading, onPlaying, onEnded]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isPlaying) {
      player.play();
      onPlaying(true);
    } else {
      player.pause();
      onPlaying(false);
    }
  }, [isPlaying, onPlaying]);

  return (
    <div data-vjs-player className={"hidden"}>
      <div ref={audioRef} className={"hidden"} />
    </div>
  );
};

export default YouTubeAudioPlayer;
