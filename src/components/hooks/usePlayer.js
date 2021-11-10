import { useEffect, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import 'context-filter-polyfill';

const {
  isPlayerSupported,
  create: createMediaPlayer,
  PlayerState,
  PlayerEventType
} = window.IVSPlayer;
const { ENDED, PLAYING, READY, BUFFERING } = PlayerState;
const { ERROR } = PlayerEventType;

const usePlayer = () => {
  // Refs
  const player = useRef(null);
  const video = useRef();
  const pid = useRef(uuidv4());
  const name = useRef('');

  // State
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  // Generic PlayerState event listener
  const onStateChange = useCallback(() => {
    const newState = player.current.getState();
    setLoading(newState !== PLAYING);
    setPaused(player.current.isPaused());
    console.log(`${name.current} Player State - ${newState}`);
  }, []);

  // Generic PlayerEventType event listener
  const onError = useCallback((err) => {
    console.warn(`${name.current} Player Event - ERROR:`, err, player.current);
  }, []);

  const destroy = useCallback(() => {
    if (!player.current) return;

    // remove event listeners
    player.current.removeEventListener(READY, onStateChange);
    player.current.removeEventListener(PLAYING, onStateChange);
    player.current.removeEventListener(BUFFERING, onStateChange);
    player.current.removeEventListener(ENDED, onStateChange);
    player.current.removeEventListener(ERROR, onError);

    // delete and nullify player
    player.current.pause();
    player.current.delete();
    player.current = null;
    video.current.removeAttribute('src'); // remove possible stale src

    // reset player state controls to initial values
    setLoading(false);
    setMuted(true);
    setPaused(false);
  }, [onError, onStateChange]);

  const create = useCallback(() => {
    if (!isPlayerSupported) return;

    // If a player instnace already exists, destroy it before creating a new one
    if (player.current) destroy();

    player.current = createMediaPlayer();
    video.current.crossOrigin = 'anonymous';
    player.current.attachHTMLVideoElement(video.current);

    player.current.addEventListener(READY, onStateChange);
    player.current.addEventListener(PLAYING, onStateChange);
    player.current.addEventListener(BUFFERING, onStateChange);
    player.current.addEventListener(ENDED, onStateChange);
    player.current.addEventListener(ERROR, onError);
  }, [destroy, onError, onStateChange]);

  const load = useCallback(
    (playbackUrl, startPlaybackAfterLoad = false) => {
      if (player.current.core.isLoaded) {
        create();
      }
      player.current.load(playbackUrl);
      if (startPlaybackAfterLoad) togglePlayPause(true);
    },
    [create]
  );

  const toggleMute = () => {
    if (!player.current) return;
    const muteNext = !player.current.isMuted();
    player.current.setMuted(muteNext);
    setMuted(muteNext);
  };

  const togglePlayPause = (state) => {
    if (!player.current) return;

    switch (state) {
      case 'play': {
        player.current.play();
        break;
      }
      case 'pause': {
        player.current.pause();
        break;
      }
      default: {
        if (player.current.isPaused()) {
          player.current.play();
        } else {
          player.current.pause();
        }
      }
    }

    setPaused(player.current.isPaused());
  };

  const setName = (newName) => {
    if (newName && newName !== name.current) {
      name.current = newName;
    }
  };

  // Initialization
  useEffect(() => {
    create();
    return () => destroy();
  }, [create, destroy]);

  // Handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (loading || !player.current) return;
    setMuted(player.current.isMuted());
  }, [loading]);

  return {
    instance: player.current,
    name: name.current,
    pid: pid.current,
    togglePlayPause,
    toggleMute,
    destroy,
    loading,
    setName,
    paused,
    muted,
    video,
    load
  };
};

export default usePlayer;
