import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "videojs-youtube";
import { usePlaybackWindow } from "./usePlaybackWindow";

const ONE_HOUR_IN_SECONDS = 60 * 60;

interface YouTubeAudioPlayerProps {
  youtubeURL: string;
  sourceSession: number;
  onReady: () => void;
  onWaiting: () => void;
  onResumed: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onPlaybackWindowMuted: () => void;
  startAt?: number;
  isPlaying: boolean;
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  youtubeURL,
  sourceSession,
  onReady,
  onWaiting,
  onResumed,
  onPlay,
  onPause,
  onEnded,
  onPlaybackWindowMuted,
  startAt = 0,
  isPlaying,
}) => {
  const isSafari = useRef(false);
  const audioRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const isLoading = useRef(true);
  const embeddedIsPlaying = useRef(false);
  const hasWaitedInitially = useRef(false);
  const hasReceivedPlayInitially = useRef(false);
  const hasConfiguredPlaybackWindow = useRef(false);
  const isChangingSource = useRef(false);
  const playbackWindow = usePlaybackWindow({
    windowSeconds: ONE_HOUR_IN_SECONDS,
    onForegroundExpired: onEnded,
    onBackgroundExpired: () => {
      const player = playerRef.current;

      if (player) {
        player.muted(true);
      }

      // Hidden-tab source changes are unreliable, so surface a stopped state instead.
      onPlaybackWindowMuted();
    },
  });

  const updatePlayingState = () => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  };

  useEffect(() => {
    isSafari.current = /^((?!chrome|android).)*safari/i.test(
      navigator.userAgent
    );

    // Make sure Video.js player is only initialized once.
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
            controls: false,
            autoplay: true,
            audioOnlyMode: true,
            preload: "auto",
          },
          () => {}
        );
      }
    }
  }, []);

  // Dispose the Video.js player when the functional component unmounts.
  useEffect(() => {
    return () => {
      const player = playerRef.current;

      playbackWindow.reset();

      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playbackWindow]);

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
      embeddedIsPlaying.current = false;
    }
  };

  useEffect(() => {
    const player = playerRef.current;

    if (player) {
      playbackWindow.reset();
      hasConfiguredPlaybackWindow.current = false;
      embeddedIsPlaying.current = false;
      isChangingSource.current = true;
      isLoading.current = true;
      hasWaitedInitially.current = false;
      player.muted(false);

      const sources = [
        {
          type: "video/youtube", //important
          src: youtubeURL,
        },
      ];
      player.src(sources);
      player.currentTime(startAt);
    }
  }, [youtubeURL, sourceSession, startAt, playbackWindow]);

  useEffect(() => {
    updatePlayingState();
  }, [isPlaying]);

  useEffect(() => {
    const applyPendingSeek = () => {
      const player = playerRef.current;

      if (!player) {
        return;
      }

      playbackWindow.applyPendingSeek(
        () => player.currentTime(),
        (seconds) => player.currentTime(seconds)
      );
    };

    const configurePlaybackWindow = () => {
      const player = playerRef.current;

      if (!player || hasConfiguredPlaybackWindow.current) {
        return;
      }

      const duration = player.duration();

      if (
        typeof duration !== "number" ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        return;
      }

      playbackWindow.configure({
        duration,
        seekTo: (seconds) => player.currentTime(seconds),
        onConfigured: () => {
          hasConfiguredPlaybackWindow.current = true;

          if (isPlaying && embeddedIsPlaying.current && !isLoading.current) {
            playbackWindow.start();
          }
        },
      });

      if (duration <= ONE_HOUR_IN_SECONDS) {
        hasConfiguredPlaybackWindow.current = true;
      }
    };

    const handleCanPlay = () => {
      const player = playerRef.current;

      if (player && !isSafari.current) {
        configurePlaybackWindow();
        applyPendingSeek();
        onReady();
      }
    };

    const handleCanPlay2 = () => {
      const player = playerRef.current;

      if (player && isLoading.current) {
        configurePlaybackWindow();
        applyPendingSeek();
        isLoading.current = false;
        onReady();
      }

      if (!embeddedIsPlaying.current) {
        if (isPlaying) {
          window.setTimeout(() => {
            if (isPlaying && isChangingSource.current) {
              playAudio();
            }
          }, 0);
        } else if (!isChangingSource.current) {
          onPause();
        }
      }
    };

    const handleWaiting = () => {
      playbackWindow.pause();

      // The first waiting event seems to be erroneous; the video can already play.
      if (hasWaitedInitially.current) {
        isLoading.current = true;
        onWaiting();
      } else {
        hasWaitedInitially.current = true;
      }
    };

    const handleResumed = () => {
      isChangingSource.current = false;
      isLoading.current = false;
      applyPendingSeek();
      playbackWindow.start();
      onResumed();
    };

    const handleDurationChange = () => {
      configurePlaybackWindow();
    };

    const handlePlay = () => {
      if (hasReceivedPlayInitially.current) {
        isChangingSource.current = false;
        embeddedIsPlaying.current = true;
        isLoading.current = false;
        applyPendingSeek();
        playbackWindow.start();
        onPlay();
      } else {
        hasReceivedPlayInitially.current = true;
      }
    };

    const handlePause = () => {
      embeddedIsPlaying.current = false;
      isLoading.current = false;
      playbackWindow.pause();

      // Video.js can emit pause while swapping YouTube sources; keep parent state stable.
      if (isChangingSource.current) {
        return;
      }

      onPause();
    };

    const handleEnded = () => {
      playbackWindow.reset();
      onEnded();
    };

    const handleTimeUpdate = () => {
      const player = playerRef.current;
      const currentTime = player?.currentTime();

      if (
        player &&
        typeof currentTime === "number"
      ) {
        playbackWindow.expireIfPastEnd(currentTime);
      }
    };

    const player = playerRef.current;

    if (player) {
      player.on("ready", handleCanPlay);
      player.on("canplay", handleCanPlay2);
      player.on("durationchange", handleDurationChange);
      player.on("waiting", handleWaiting);
      player.on("playing", handleResumed);
      player.on("play", handlePlay);
      player.on("pause", handlePause);
      player.on("ended", handleEnded);
      player.on("timeupdate", handleTimeUpdate);
    }

    // Clean up the event listeners when the component unmounts.
    return () => {
      const player = playerRef.current;

      if (player) {
        player.off("ready", handleCanPlay);
        player.off("canplay", handleCanPlay2);
        player.off("durationchange", handleDurationChange);
        player.off("waiting", handleWaiting);
        player.off("playing", handleResumed);
        player.off("play", handlePlay);
        player.off("pause", handlePause);
        player.off("ended", handleEnded);
        player.off("timeupdate", handleTimeUpdate);
      }
    };
  }, [
    isPlaying,
    sourceSession,
    playbackWindow,
    onReady,
    onWaiting,
    onResumed,
    onPlay,
    onPause,
    onEnded,
    onPlaybackWindowMuted,
  ]);

  return (
    <div data-vjs-player className={"hidden"}>
      <div ref={audioRef} className={"hidden"} />
    </div>
  );
};

export default YouTubeAudioPlayer;
