import { useEffect, useState, useRef, useCallback, useMemo } from 'react';

const {
  isPlayerSupported,
  create: createMediaPlayer,
  PlayerState,
  PlayerEventType
} = window.IVSPlayer;
const { ENDED, PLAYING, READY, BUFFERING } = PlayerState;
const { ERROR } = PlayerEventType;

const usePlayer = (id) => {
  const player = useRef(null);
  const video = useRef();
  const pid = useRef(id);

  const {
    muted,
    paused,
    loading,
    toggleMute,
    play,
    pause,
    togglePlayPause,
    setLoading,
    resetControls
  } = usePlayerControls(player);

  // Generic PlayerState event listener
  const onStateChange = useCallback(() => {
    const newState = player.current.getState();
    setLoading(newState !== PLAYING);
    console.log(`Player ${pid.current} State - ${newState}`);
  }, [setLoading]);

  // Generic PlayerEventType event listener
  const onError = useCallback((err) => {
    console.warn(`Player ${pid.current} Event - ERROR:`, err, player.current);
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
    resetControls();
  }, [onError, onStateChange, resetControls]);

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
    (playbackUrl) => {
      if (!player.current || player.current.core.isLoaded) create();
      player.current.load(playbackUrl);
    },
    [create]
  );

  const log = (...messages) => {
    console.log(`Player ${pid.current}:`, ...messages);
  };

  // Handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (loading || !player.current) return;
    toggleMute(player.current.isMuted());
  }, [loading, toggleMute]);

  return {
    player: player.current,
    pid: pid.current,
    togglePlayPause,
    toggleMute,
    destroy,
    loading,
    paused,
    muted,
    video,
    load,
    play,
    pause,
    log
  };
};

const usePlayerControls = (player) => {
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);

  const play = useCallback(() => {
    if (!player.current) return;

    if (player.current.isPaused()) {
      player.current.play();
      setPaused(false);
    }
  }, [player]);

  const pause = useCallback(() => {
    if (!player.current) return;

    if (!player.current.isPaused()) {
      player.current.pause();
      setPaused(true);
    }
  }, [player]);

  const togglePlayPause = useCallback(() => {
    if (!player.current) return;

    player.current.isPaused() ? play() : pause();
  }, [pause, play, player]);

  const toggleMute = useCallback(
    (mute = false) => {
      if (!player.current) return;

      const muteNext = mute || !player.current.isMuted();
      player.current.setMuted(muteNext);
      setMuted(muteNext);
    },
    [player]
  );

  const resetControls = useCallback(() => {
    setMuted(true);
    setPaused(false);
    setLoading(true);
  }, []);

  return useMemo(
    () => ({
      muted,
      paused,
      loading,
      toggleMute,
      play,
      pause,
      togglePlayPause,
      setLoading,
      resetControls
    }),
    [loading, muted, pause, paused, play, toggleMute, togglePlayPause, resetControls]
  );
};

export default usePlayer;
