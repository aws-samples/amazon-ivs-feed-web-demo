import { useEffect, useState, useRef } from 'react';
import 'context-filter-polyfill';

const { isPlayerSupported, create, PlayerState, PlayerEventType } = window.IVSPlayer;

const usePlayer = (video) => {
  const player = useRef(null);
  const pid = useRef(video.current);
  const startPlaybackAfterLoad = useRef(false);

  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  const log = (message) => {
    console.log(`Player ${pid.current}: ${message}`);
  };

  // handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (loading || !player.current) return;
    setMuted(player.current.isMuted());
  }, [loading]);

  useEffect(() => {
    if (isPlayerSupported) {
      const { ENDED, PLAYING, READY, BUFFERING } = PlayerState;
      const { ERROR } = PlayerEventType;

      const onStateChange = () => {
        const newState = player.current.getState();
        setLoading(newState !== PLAYING);
        setPaused(player.current.isPaused());
        if (newState === READY && startPlaybackAfterLoad.current) {
          player.current.play();
        }
        console.log(`Player ${pid.current} State - ${newState}`);
      };

      const onError = (err) => {
        console.warn(`Player ${pid.current} Event - ERROR:`, err);
      };

      player.current = create();
      video.current.crossOrigin = 'anonymous';
      player.current.attachHTMLVideoElement(video.current);

      player.current.addEventListener(READY, onStateChange);
      player.current.addEventListener(PLAYING, onStateChange);
      player.current.addEventListener(BUFFERING, onStateChange);
      player.current.addEventListener(ENDED, onStateChange);
      player.current.addEventListener(ERROR, onError);

      return () => {
        player.current?.removeEventListener(READY, onStateChange);
        player.current?.removeEventListener(PLAYING, onStateChange);
        player.current?.removeEventListener(BUFFERING, onStateChange);
        player.current?.removeEventListener(ENDED, onStateChange);
        player.current?.removeEventListener(ERROR, onError);
      };
    }
  }, [video]);

  const preload = (playbackUrl, startPlayback = false) => {
    player.current.load(playbackUrl);
    startPlaybackAfterLoad.current = startPlayback;
  };

  const toggleMute = () => {
    const muteNext = !player.current.isMuted();
    player.current.setMuted(muteNext);
    setMuted(muteNext);
  };

  const togglePlayPause = () => {
    if (player.current.isPaused()) {
      player.current.play();
    } else {
      player.current.pause();
    }
    setPaused(player.current.isPaused());
  };

  return {
    instance: player.current,
    pid: pid.current,
    togglePlayPause,
    toggleMute,
    loading,
    paused,
    muted,
    preload,
    video,
    log
  };
};

export default usePlayer;
