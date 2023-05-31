import React, { useRef, useEffect, useState } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "videojs-youtube";
import "video.js/dist/video-js.css";
import "../styles/global.css";

interface Props {}

interface YouTubeAudioPlayerProps {
  videoId: string;
  onReady: (player: Player) => void;
  onWaiting: () => void;
  onResumed: () => void;
  startAt?: number;
  isPlaying: boolean;
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  videoId,
  onReady,
  onWaiting,
  onResumed,
  startAt = 0,
  isPlaying,
}) => {
  const audioRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [hasWaitedInitially, setWaitedInitially] = useState(false);

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const audioElement = document.createElement("audio");
      audioElement.classList.add("video-js");

      if (audioRef.current) {
        audioRef.current.appendChild(audioElement);

        const player = (playerRef.current = videojs(
          audioElement,
          {
            controls: false, // Disable control elements
            autoplay: true, // Enable autoplay as this causes YouTube to begin loading
            audioOnlyMode: true,
            preload: "auto", // Preload the audio
          },
          () => {}
        ));
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

    if (player) {
      if (player.currentSrc()) {
        player.play();
      } else {
        console.error("Audio source not set.");
      }
    }
  };

  const pauseAudio = () => {
    const player = playerRef.current;

    if (player) {
      player.pause();
    }
  };

  useEffect(() => {
    const player = playerRef.current;

    if (player) {
      const sources = [
        {
          type: "video/youtube", //important
          src: "https://www.youtube.com/watch?v=" + videoId,
        },
      ];
      player.src(sources);
      player.currentTime(startAt);
      player.pause();
    }
  }, [videoId]);

  useEffect(() => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying]);

  useEffect(() => {
    const handleCanPlay = () => {
      onReady(playerRef.current as Player);
    };

    const handleWaiting = () => {
      // the first time the player sends the waiting event seems to be always erroneous
      // and we can actually already play the video
      if (hasWaitedInitially) {
        onWaiting();
      } else {
        setWaitedInitially(true);
      }
    };

    const handleResumed = () => {
      onResumed();
    };

    const player = playerRef.current;

    if (player) {
      player.on("ready", handleCanPlay);
      player.on("canplay", handleCanPlay);
      player.on("waiting", handleWaiting);
      player.on("playing", handleResumed);
    }

    // Clean up the event listener when the component unmounts
    return () => {
      const player = playerRef.current;

      if (player) {
        player.off("canplay", handleCanPlay);
        player.off("waiting", handleWaiting);
        player.off("playing", handleResumed);
      }
    };
  }, [onReady, onWaiting, onResumed]);

  return (
    <div data-vjs-player className={"hidden"}>
      <div ref={audioRef} />
    </div>
  );
};

export default YouTubeAudioPlayer;
