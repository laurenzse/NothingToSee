import React, { useRef, useEffect, useCallback, useReducer } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "videojs-youtube";

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

// State for tracking player initialization quirks
interface PlayerState {
  isLoading: boolean;
  embeddedIsPlaying: boolean;
  hasWaitedInitially: boolean;
  hasReceivedPlayInitially: boolean;
}

type PlayerAction =
  | { type: "SET_LOADING"; isLoading: boolean }
  | { type: "SET_EMBEDDED_PLAYING"; isPlaying: boolean }
  | { type: "MARK_WAITED_INITIALLY" }
  | { type: "MARK_RECEIVED_PLAY_INITIALLY" }
  | { type: "RESET" };

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.isLoading };
    case "SET_EMBEDDED_PLAYING":
      return { ...state, embeddedIsPlaying: action.isPlaying };
    case "MARK_WAITED_INITIALLY":
      return { ...state, hasWaitedInitially: true };
    case "MARK_RECEIVED_PLAY_INITIALLY":
      return { ...state, hasReceivedPlayInitially: true };
    case "RESET":
      return {
        isLoading: true,
        embeddedIsPlaying: false,
        hasWaitedInitially: false,
        hasReceivedPlayInitially: false,
      };
    default:
      return state;
  }
};

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
  /**
   * Safari-specific detection for handling browser quirks.
   * Safari has issues with video.js event timing that require workarounds.
   * See: Video.js initialization behavior differs in Safari vs other browsers
   */
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const audioRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  const [state, dispatch] = useReducer(playerReducer, {
    isLoading: true,
    embeddedIsPlaying: false,
    hasWaitedInitially: false,
    hasReceivedPlayInitially: false,
  });

  // Initialize video.js player once
  useEffect(() => {
    if (!playerRef.current && audioRef.current) {
      // The Video.js player needs to be inside the component element for React 18 Strict Mode
      const audioElement = document.createElement("audio");
      audioElement.classList.add("video-js");
      audioElement.classList.add("hidden");

      audioRef.current.appendChild(audioElement);

      playerRef.current = videojs(
        audioElement,
        {
          controls: false,
          autoplay: true, // Start loading immediately
          audioOnlyMode: true,
          preload: "auto",
        },
        () => {}
      );
    }
  }, []);

  // Dispose video.js player on unmount
  useEffect(() => {
    return () => {
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  // Play audio function with state management
  const playAudio = useCallback(() => {
    const player = playerRef.current;

    if (player && player.currentSrc()) {
      if (!state.embeddedIsPlaying) {
        player.play();
        dispatch({ type: "SET_EMBEDDED_PLAYING", isPlaying: true });
      }
    }
  }, [state.embeddedIsPlaying]);

  // Pause audio function with state management
  const pauseAudio = useCallback(() => {
    const player = playerRef.current;

    if (player && state.embeddedIsPlaying) {
      player.pause();
      dispatch({ type: "SET_EMBEDDED_PLAYING", isPlaying: false });
    }
  }, [state.embeddedIsPlaying]);

  // Update playing state when isPlaying prop changes
  const updatePlayingState = useCallback(() => {
    if (isPlaying) {
      playAudio();
    } else {
      pauseAudio();
    }
  }, [isPlaying, playAudio, pauseAudio]);

  // Update video source when URL changes
  useEffect(() => {
    const player = playerRef.current;

    if (player) {
      const sources = [
        {
          type: "video/youtube",
          src: youtubeURL,
        },
      ];
      player.src(sources);
      player.currentTime(startAt);

      // Reset state when new video loads
      dispatch({ type: "RESET" });
    }
  }, [youtubeURL, startAt]);

  // Sync playing state with prop
  useEffect(() => {
    updatePlayingState();
  }, [updatePlayingState]);

  // Setup event handlers
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    /**
     * Safari quirk: "ready" event timing differs from other browsers
     */
    const handleReady = () => {
      if (!isSafari) {
        onReady();
      }
    };

    /**
     * Main readiness handler - fires when player can play
     * Handles initial loading state
     */
    const handleCanPlay = () => {
      if (state.isLoading) {
        dispatch({ type: "SET_LOADING", isLoading: false });
        onReady();
      }
      if (!state.embeddedIsPlaying) {
        onPause();
      }
    };

    /**
     * Video.js quirk: First "waiting" event often fires erroneously
     * Ignore the first occurrence to prevent false loading states
     */
    const handleWaiting = () => {
      if (state.hasWaitedInitially) {
        dispatch({ type: "SET_LOADING", isLoading: true });
        onWaiting();
      } else {
        dispatch({ type: "MARK_WAITED_INITIALLY" });
      }
    };

    const handlePlaying = () => {
      dispatch({ type: "SET_LOADING", isLoading: false });
      onResumed();
    };

    /**
     * Video.js quirk: First "play" event fires during initialization
     * Ignore the first occurrence to prevent false play state
     */
    const handlePlay = () => {
      if (state.hasReceivedPlayInitially) {
        dispatch({ type: "SET_EMBEDDED_PLAYING", isPlaying: true });
        dispatch({ type: "SET_LOADING", isLoading: false });
        onPlay();
      } else {
        dispatch({ type: "MARK_RECEIVED_PLAY_INITIALLY" });
      }
    };

    const handlePause = () => {
      dispatch({ type: "SET_EMBEDDED_PLAYING", isPlaying: false });
      dispatch({ type: "SET_LOADING", isLoading: false });
      onPause();
    };

    const handleEnded = () => {
      onEnded();
    };

    // Attach event listeners
    player.on("ready", handleReady);
    player.on("canplay", handleCanPlay);
    player.on("waiting", handleWaiting);
    player.on("playing", handlePlaying);
    player.on("play", handlePlay);
    player.on("pause", handlePause);
    player.on("ended", handleEnded);

    // Cleanup
    return () => {
      if (player) {
        player.off("ready", handleReady);
        player.off("canplay", handleCanPlay);
        player.off("waiting", handleWaiting);
        player.off("playing", handlePlaying);
        player.off("play", handlePlay);
        player.off("pause", handlePause);
        player.off("ended", handleEnded);
      }
    };
  }, [
    isSafari,
    state.isLoading,
    state.embeddedIsPlaying,
    state.hasWaitedInitially,
    state.hasReceivedPlayInitially,
    onReady,
    onWaiting,
    onResumed,
    onPlay,
    onPause,
    onEnded,
  ]);

  return (
    <div data-vjs-player className={"hidden"}>
      <div ref={audioRef} className={"hidden"} />
    </div>
  );
};

export default YouTubeAudioPlayer;
