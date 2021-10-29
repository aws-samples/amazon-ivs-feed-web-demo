import { useEffect, useState, useRef } from 'react';

const { isPlayerSupported, create, PlayerState, PlayerEventType } = window.IVSPlayer;

const usePlayer = (video) => {
  const player = useRef(null);
  const pid = useRef(video.current);
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const canvas = useRef();

  // handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (loading || !player.current) return;
    setMuted(player.current.isMuted());
  }, [loading]);

  useEffect(() => {
    if (isPlayerSupported) {
      const { ENDED, PLAYING, READY } = PlayerState;
      const { ERROR } = PlayerEventType;

      const onStateChange = () => {
        const newState = player.current.getState();
        console.log(`Player ${pid.current} State - ${newState}`);
        setLoading(newState !== PLAYING);
        setPaused(player.current.isPaused());
      };

      const onError = (err) => {
        console.warn(`Player ${pid.current} Event - ERROR:`, err);
      };

      const renderBlur = () => {
        const draw = () => {
          if (player.current && !player.current.isPaused()) {
            const can = canvas.current;
            const ctx = can.getContext('2d');
            ctx.drawImage(video.current, 0, 0, can.width, can.height);
            requestAnimationFrame(draw);
          }
        };
        requestAnimationFrame(draw);
      };

      player.current = create();
      player.current.attachHTMLVideoElement(video.current);

      player.current.addEventListener(READY, onStateChange);
      player.current.addEventListener(PLAYING, renderBlur);
      player.current.addEventListener(PLAYING, onStateChange);
      player.current.addEventListener(ENDED, onStateChange);
      player.current.addEventListener(ERROR, onError);

      return () => {
        player.current?.removeEventListener(READY, onStateChange);
        player.current?.removeEventListener(PLAYING, onStateChange);
        player.current?.removeEventListener(PLAYING, renderBlur);
        player.current?.removeEventListener(ENDED, onStateChange);
        player.current?.removeEventListener(ERROR, onError);
      };
    }
  }, [video]);

  const preload = (playbackUrl) => {
    console.log('preloading');
    player.current.pause();
    player.current.load(playbackUrl);
    return player.current;
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
    canvas
  };
};

export default usePlayer;
