import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "videojs-youtube";

const ONE_HOUR_IN_SECONDS = 10;

interface YouTubeAudioPlayerProps {
  youtubeURL: string;
  sourceVersion: number;
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
  sourceVersion,
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
  const hasMutedPlaybackWindow = useRef(false);
  const isChangingSource = useRef(false);
  const playbackEndsAt = useRef<number | null>(null);
  const playbackWindowRemaining = useRef<number | null>(null);
  const playbackWindowTimerStartedAt = useRef<number | null>(null);
  const playbackWindowTimeout = useRef<number | null>(null);
  const playbackWindowId = useRef(0);

  const clearPlaybackWindowTimeout = () => {
    if (playbackWindowTimeout.current !== null) {
      window.clearTimeout(playbackWindowTimeout.current);
      playbackWindowTimeout.current = null;
    }
  };

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

      clearPlaybackWindowTimeout();

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
      embeddedIsPlaying.current = false;
    }
  };

  useEffect(() => {
    const player = playerRef.current;

    if (player) {
      clearPlaybackWindowTimeout();
      playbackWindowId.current += 1;
      hasConfiguredPlaybackWindow.current = false;
      hasMutedPlaybackWindow.current = false;
      playbackEndsAt.current = null;
      playbackWindowRemaining.current = null;
      playbackWindowTimerStartedAt.current = null;
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
  }, [youtubeURL, sourceVersion, startAt]);

  useEffect(() => {
    updatePlayingState();
  }, [isPlaying]);

  useEffect(() => {
    const endPlaybackWindow = (windowId: number) => {
      const player = playerRef.current;

      if (
        !player ||
        windowId !== playbackWindowId.current ||
        hasMutedPlaybackWindow.current
      ) {
        return;
      }

      hasMutedPlaybackWindow.current = true;
      playbackEndsAt.current = null;
      playbackWindowRemaining.current = 0;
      playbackWindowTimerStartedAt.current = null;
      clearPlaybackWindowTimeout();

      if (document.hidden) {
        player.muted(true);
        onPlaybackWindowMuted();
      } else {
        onEnded();
      }
    };

    const pausePlaybackWindowTimer = () => {
      if (playbackWindowTimeout.current === null) {
        return;
      }

      window.clearTimeout(playbackWindowTimeout.current);
      playbackWindowTimeout.current = null;

      if (
        playbackWindowRemaining.current !== null &&
        playbackWindowTimerStartedAt.current !== null
      ) {
        const elapsedSeconds =
          (Date.now() - playbackWindowTimerStartedAt.current) / 1000;
        playbackWindowRemaining.current = Math.max(
          playbackWindowRemaining.current - elapsedSeconds,
          0
        );
      }

      playbackWindowTimerStartedAt.current = null;
    };

    const startPlaybackWindowTimer = (windowId: number) => {
      if (
        windowId !== playbackWindowId.current ||
        hasMutedPlaybackWindow.current ||
        playbackWindowRemaining.current === null ||
        playbackWindowTimeout.current !== null
      ) {
        return;
      }

      if (playbackWindowRemaining.current <= 0) {
        endPlaybackWindow(windowId);
        return;
      }

      playbackWindowTimerStartedAt.current = Date.now();
      playbackWindowTimeout.current = window.setTimeout(() => {
        playbackWindowTimeout.current = null;
        playbackWindowTimerStartedAt.current = null;
        playbackWindowRemaining.current = 0;
        endPlaybackWindow(windowId);
      }, playbackWindowRemaining.current * 1000);
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

      hasConfiguredPlaybackWindow.current = true;

      if (duration > ONE_HOUR_IN_SECONDS) {
        const latestStart = duration - ONE_HOUR_IN_SECONDS;
        const randomStart = Math.random() * latestStart;
        const windowId = playbackWindowId.current;

        player.currentTime(randomStart);
        playbackEndsAt.current = randomStart + ONE_HOUR_IN_SECONDS;
        playbackWindowRemaining.current = ONE_HOUR_IN_SECONDS;

        if (isPlaying && embeddedIsPlaying.current && !isLoading.current) {
          startPlaybackWindowTimer(windowId);
        }
      }
    };

    const handleCanPlay = () => {
      const player = playerRef.current;

      if (player && !isSafari.current) {
        configurePlaybackWindow();
        onReady();
      }
    };

    const handleCanPlay2 = () => {
      const player = playerRef.current;

      if (player && isLoading.current) {
        configurePlaybackWindow();
        isLoading.current = false;
        onReady();
      }

      if (!embeddedIsPlaying.current) {
        if (isPlaying) {
          playAudio();
        } else if (!isChangingSource.current) {
          onPause();
        }
      }
    };

    const handleWaiting = () => {
      pausePlaybackWindowTimer();

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
      startPlaybackWindowTimer(playbackWindowId.current);
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
        startPlaybackWindowTimer(playbackWindowId.current);
        onPlay();
      } else {
        hasReceivedPlayInitially.current = true;
      }
    };

    const handlePause = () => {
      embeddedIsPlaying.current = false;
      isLoading.current = false;
      pausePlaybackWindowTimer();

      if (isChangingSource.current) {
        return;
      }

      onPause();
    };

    const handleEnded = () => {
      clearPlaybackWindowTimeout();
      playbackWindowTimerStartedAt.current = null;
      onEnded();
    };

    const handleTimeUpdate = () => {
      const player = playerRef.current;
      const currentTime = player?.currentTime();

      if (
        player &&
        playbackEndsAt.current !== null &&
        typeof currentTime === "number" &&
        currentTime >= playbackEndsAt.current
      ) {
        endPlaybackWindow(playbackWindowId.current);
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
    sourceVersion,
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
