"use client";
import { useEffect, useRef } from "react";
import { compileNonPath } from "next/dist/shared/lib/router/utils/prepare-destination";

interface YouTubeAudioPlayerProps {
  videoId: string;
  onReady: () => void;
  onWaiting: () => void;
  onResumed: () => void;
  isPlaying: boolean;
}

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({
  videoId,
  onReady,
  onWaiting,
  onResumed,
  isPlaying,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  /**
   * Fetches the YouTube video data from the provided video ID.
   * @param videoId The ID of the YouTube video.
   * @returns A Promise that resolves to the fetched video data.
   */
  const fetchYouTubeVideoData = async (videoId: string): Promise<string> => {
    const url =
      "https://images" +
      ~~(Math.random() * 33) +
      "-focus-opensocial.googleusercontent.com/gadgets/proxy?container=none&url=" +
      encodeURIComponent("https://www.youtube.com/watch?hl=en&v=" + videoId);

    const response = await fetch(url);
    if (response.ok) {
      return response.text();
    } else {
      throw new Error(
        "Failed to fetch YouTube video data. Status: " + response.status
      );
    }
  };

  /**
   * Extracts the relevant YouTube video data from the response.
   * @param data The raw data received from the YouTube video request.
   * @returns The parsed YouTube video data.
   */
  const extractYouTubeData = (data: string): any => {
    const regex =
      /(?:ytplayer\.config\s*=\s*|ytInitialPlayerResponse\s?=\s?)(.+?)(?:;var|;\(function|\)?;\s*if|;\s*if|;\s*ytplayer\.|;\s*<\/script)/gmsu;
    data = data.split("window.getPageData")[0];
    data = data.replace("ytInitialPlayerResponse = null", "");
    data = data.replace(
      "ytInitialPlayerResponse=window.ytInitialPlayerResponse",
      ""
    );
    data = data.replace(
      "ytplayer.config={args:{raw_player_response:ytInitialPlayerResponse}};",
      ""
    );
    const matches = regex.exec(data);
    return matches && matches.length > 1 ? JSON.parse(matches[1]) : false;
  };

  /**
   * Retrieves the audio streams from the parsed YouTube video data.
   * @param parsedData The parsed YouTube video data.
   * @returns An array of audio streams.
   */
  const getAudioStreams = (parsedData: any): any[] => {
    let streams: any[] = [];
    if (parsedData.streamingData) {
      if (parsedData.streamingData.adaptiveFormats) {
        streams = streams.concat(parsedData.streamingData.adaptiveFormats);
      }
      if (parsedData.streamingData.formats) {
        streams = streams.concat(parsedData.streamingData.formats);
      }
    }
    return streams;
  };

  /**
   * Selects the appropriate audio source from the available audio streams.
   * @param streams An array of audio streams.
   * @returns The URL of the selected audio source.
   */
  const selectAudioSource = (streams: any[]): string | undefined => {
    const audioQualityPriority = ["256kbps", "128kbps", "48kbps"];
    for (const stream of streams) {
      const itag = stream.itag * 1;
      let quality: string | undefined;
      switch (itag) {
        case 139:
          quality = "48kbps";
          break;
        case 140:
          quality = "128kbps";
          break;
        case 141:
          quality = "256kbps";
          break;
        case 249:
          quality = "webm_l";
          break;
        case 250:
          quality = "webm_m";
          break;
        case 251:
          quality = "webm_h";
          break;
      }
      if (quality && audioQualityPriority.includes(quality)) {
        return stream.url;
      }
    }
    return undefined;
  };

  const setAudioSource = (audioSource: string | undefined) => {
    if (audioSource) {
      // @ts-ignore
      audioRef.current.src = audioSource;
    } else {
      console.error("Failed to find a suitable audio source.");
    }
  };

  const playAudio = () => {
    // @ts-ignore
    if (audioRef.current.src) {
      // @ts-ignore
      audioRef.current.play();
    } else {
      console.error("Audio source not set.");
    }
  };

  const pauseAudio = () => {
    // @ts-ignore
    audioRef.current.pause();
  };

  // useEffect(() => {
  //   const onVideoProgressUpdate = (e: any) => {
  //     const player = audioRef.current as HTMLAudioElement;
  //     var percentageBuffered = 0;
  //
  //     if (
  //       player.buffered.length > 0 &&
  //       player.buffered.end &&
  //       player.duration
  //     ) {
  //       percentageBuffered = player.buffered.end(0) / player.duration;
  //     }
  //
  //     console.log(percentageBuffered);
  //   };
  //
  //   const onVideoStalled = (e: any) => {
  //     const player = audioRef.current as HTMLAudioElement;
  //     player.load();
  //
  //     console.log("aaaaaa");
  //
  //     // Threw in these two lines for good measure.
  //     player.play();
  //     player.pause();
  //   };
  //
  //   // @ts-ignore
  //   audioRef.current.addEventListener("progress", onVideoProgressUpdate, false);
  //
  //   // @ts-ignore
  //   audioRef.current.addEventListener("stalled", onVideoStalled, false);
  // });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchYouTubeVideoData(videoId);
        const parsedData = extractYouTubeData(data);
        const streams = getAudioStreams(parsedData);
        const audioSource = selectAudioSource(streams);
        setAudioSource(audioSource);
      } catch (error) {
        console.error("Failed to fetch YouTube video data:", error);
      }
    };

    fetchData();
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
      // Invoke the callback with the readiness information
      onReady();
    };

    const handleWaiting = () => {
      // Invoke the callback with the readiness information
      onWaiting();
    };

    const handleResumed = () => {
      // Invoke the callback with the readiness information
      onResumed();
    };

    // @ts-ignore
    audioRef.current.addEventListener("canplay", handleCanPlay);
    // @ts-ignore
    audioRef.current.addEventListener("waiting", handleWaiting);
    // @ts-ignore
    audioRef.current.addEventListener("playing", handleResumed);

    // Clean up the event listener when the component unmounts
    return () => {
      if (audioRef.current) {
        // @ts-ignore
        audioRef.current.removeEventListener("canplay", handleCanPlay);
        // @ts-ignore
        audioRef.current.removeEventListener("waiting", handleWaiting);
        // @ts-ignore
        audioRef.current.removeEventListener("playing", handleResumed);
      }
    };
  }, [onReady, onWaiting, onResumed]);

  return (
    <div>
      <audio ref={audioRef} id="youtube" />
    </div>
  );
};

export default YouTubeAudioPlayer;
