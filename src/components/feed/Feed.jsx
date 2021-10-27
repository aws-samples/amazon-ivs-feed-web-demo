import React, { useEffect, useRef, useState } from 'react';

import Spinner from './Spinner';
import Button from '../common/Button';
import Like from './Like';
import { Play } from '../../assets/icons';
import useStream from '../../contexts/Stream/useStream';

import './Feed.css';

const { isPlayerSupported, create, PlayerState, PlayerEventType } = window.IVSPlayer;

const Feed = ({ toggleMetadata }) => {
  const { activeStream, nextStream, prevStream } = useStream();
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  const videoRef = useRef();
  const blurRef = useRef();
  const player = useRef(null);

  useEffect(() => {
    if (player.current) {
      player.current.pause();
      player.current.load(activeStream.stream.playbackUrl);
      player.current.play();
    }
  }, [activeStream]);

  // handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (loading) return;
    setMuted(player.current?.isMuted());
  }, [loading]);

  useEffect(() => {
    if (isPlayerSupported) {
      const { ENDED, PLAYING, READY, BUFFERING } = PlayerState;
      const { ERROR } = PlayerEventType;

      const onStateChange = () => {
        const newState = player.current.getState();
        console.log(`Player State - ${newState}`);
        setLoading(newState !== PLAYING);
        setPaused(player.current.isPaused());
      };

      const renderBlur = () => {
        const draw = () => {
          if (player.current && !player.current.isPaused()) {
            const canvas = blurRef.current;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(draw);
          }
        };
        requestAnimationFrame(draw);
      };

      const onError = (err) => {
        console.warn('Player Event - ERROR:', err);
      };

      player.current = create();
      player.current.setAutoplay(true);
      player.current.attachHTMLVideoElement(videoRef.current);

      player.current.addEventListener(READY, onStateChange);
      player.current.addEventListener(BUFFERING, onStateChange);
      player.current.addEventListener(PLAYING, onStateChange);
      player.current.addEventListener(PLAYING, renderBlur);
      player.current.addEventListener(ENDED, onStateChange);
      player.current.addEventListener(ERROR, onError);

      return () => {
        player.current?.removeEventListener(READY, onStateChange);
        player.current?.removeEventListener(BUFFERING, onStateChange);
        player.current?.removeEventListener(PLAYING, onStateChange);
        player.current?.removeEventListener(PLAYING, renderBlur);
        player.current?.removeEventListener(ENDED, onStateChange);
        player.current?.removeEventListener(ERROR, onError);
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 38) prevStream(); // keyCode 38 : 'ArrowUp'
      if (e.keyCode === 40) nextStream(); // keyCode 38 : 'ArrowDown'
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  });

  const toggleMute = () => {
    const muteNext = !player.current.isMuted();
    player.current.setMuted(muteNext);
    setMuted(muteNext);
  };

  const togglePlayPause = () => {
    if (player.current.isPaused()) {
      player.current.play();
      setPaused(false);
    } else {
      player.current.pause();
      setPaused(true);
    }
  };

  if (!isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    <div className="feed">
      <div className="player-buttons">
        <Like />
        <Button onClick={toggleMute}>{muted ? 'VolumeOff' : 'VolumeUp'}</Button>

        <hr className="divider" />
        <Button onClick={prevStream}>ChevronUp</Button>
        <Button onClick={nextStream}>ChevronDown</Button>

        <span className="metadata-toggle">
          <hr className="divider" />
          <Button onClick={() => toggleMetadata()}>Description</Button>
        </span>
      </div>

      <div className="player-video">
        <video ref={videoRef} playsInline muted />
        <canvas ref={blurRef} />
        <Spinner loading={loading} />

        <button className="btn-pause" onClick={togglePlayPause} tabIndex={1}>
          {paused && <Play />}
        </button>
      </div>
    </div>
  );
};

export default Feed;
