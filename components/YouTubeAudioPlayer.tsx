import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "videojs-youtube";
import "video.js/dist/video-js.css";

interface YouTubeAudioPlayerProps {
  youtubeURL: string;
  onReady: () => void;
  onWaiting: () => void;
  onResumed: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  startAt?: number;
  isPlaying: boolean;
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  youtubeURL,
  onReady,
  onWaiting,
  onResumed,
  onPlay,
  onPause,
  onEnded,
  startAt = 0,
  isPlaying,
}) => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const audioRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const isLoading = useRef(true);
  const embeddedIsPlaying = useRef(false);
  const hasWaitedInitially = useRef(false);
  const hasReceivedPlayInitially = useRef(false);

  const updatePlayingState = () => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  };

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const audioElement = document.createElement("audio");
      audioElement.classList.add("video-js");
      audioElement.classList.add("hidden");

      if (audioRef.current) {
        audioRef.current.appendChild(audioElement);

        playerRef.current = videojs(
          audioElement,
          {
            controls: false, // Disable control elements
            autoplay: true, // Enable autoplay as this causes YouTube to begin loading
            audioOnlyMode: true,
            preload: "auto", // Preload the audio
          },
          () => {}
        );
      }
    }
  }, [onReady]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    return () => {
      const player = playerRef.current;

      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const playAudio = () => {
    const player = playerRef.current;

    if (player && player.currentSrc()) {
      if (!embeddedIsPlaying.current) {
        player.play();
        embeddedIsPlaying.current = true;
      }
    } else {
      console.error("Audio source not set.");
    }
  };

  const pauseAudio = () => {
    const player = playerRef.current;

    if (player && embeddedIsPlaying.current) {
      player.pause();
      console.log("pausing player");
      embeddedIsPlaying.current = false;
    }
  };

  useEffect(() => {
    const player = playerRef.current;

    if (player) {
      const sources = [
        {
          type: "video/youtube", //important
          src: youtubeURL,
        },
      ];
      player.src(sources);
      player.currentTime(startAt);
    }
  }, [youtubeURL, startAt]);

  useEffect(() => {
    updatePlayingState();
  }, [isPlaying]);

  useEffect(() => {
    const handleCanPlay = () => {
      const player = playerRef.current;
      console.log("player ready");

      if (player && !isSafari) {
        onReady();
      }
    };

    const handleCanPlay2 = () => {
      const player = playerRef.current;
      console.log("canplay");

      if (player && isLoading.current) {
        console.log("canplay send out");
        isLoading.current = false;
        onReady();
      }
      if (!embeddedIsPlaying.current) {
        console.log("canplay send pause");
        onPause();
      }
    };

    const handleWaiting = () => {
      // the first time the player sends the waiting event seems to be always erroneous
      // and we can actually already play the video
      if (hasWaitedInitially.current) {
        console.log("passed waiting");
        isLoading.current = true;
        onWaiting();
      } else {
        console.log("ignored waiting");
        hasWaitedInitially.current = true;
      }
    };

    const handleResumed = () => {
      isLoading.current = false;
      onResumed();
    };

    const handlePlay = () => {
      console.log("handlePlay");
      if (hasReceivedPlayInitially.current) {
        embeddedIsPlaying.current = true;
        isLoading.current = false;
        onPlay();
      } else {
        hasReceivedPlayInitially.current = true;
      }
    };

    const handlePause = () => {
      console.log("handlePause");
      embeddedIsPlaying.current = false;
      isLoading.current = false;
      onPause();
    };

    const handleEnded = () => {
      onEnded();
    };

    const player = playerRef.current;

    if (player) {
      player.on("ready", handleCanPlay);
      player.on("canplay", handleCanPlay2);
      player.on("waiting", handleWaiting);
      player.on("playing", handleResumed);
      player.on("play", handlePlay);
      player.on("pause", handlePause);
      player.on("ended", handleEnded);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      const player = playerRef.current;

      if (player) {
        player.off("ready", handleCanPlay);
        player.off("canplay", handleCanPlay);
        player.off("waiting", handleWaiting);
        player.off("playing", handleResumed);
        player.off("play", handlePlay);
        player.off("pause", handlePause);
        player.off("ended", handleEnded);
      }
    };
  }, [onReady, onWaiting, onResumed, onPlay, onPause]);

  return (
    <div data-vjs-player className={"hidden"}>
      <div ref={audioRef} className={"hidden"} />
    </div>
  );
};

export default YouTubeAudioPlayer;
