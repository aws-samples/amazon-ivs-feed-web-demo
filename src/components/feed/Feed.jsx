import React, { useEffect, useRef, useState } from 'react';

import Placeholder from './Placeholder';
import Button from '../common/Button';
import Like from './Like';
import useStream from '../../contexts/Stream/useStream';

import './Feed.css';

const { isPlayerSupported, create, PlayerState, PlayerEventType } = window.IVSPlayer;

const Feed = ({ toggleMetadata }) => {
  const { activeStream, nextStream, prevStream } = useStream();
  const [loading, setLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);

  const videoRef = useRef();
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
      const { ENDED, PLAYING, READY } = PlayerState;
      const { ERROR } = PlayerEventType;

      const onStateChange = () => {
        const newState = player.current.getState();
        console.log(`Player State - ${newState}`);
        setLoading(newState !== PLAYING);
      };

      const onError = (err) => {
        console.warn('Player Event - ERROR:', err);
      };

      player.current = create();
      player.current.setAutoplay(true);
      player.current.attachHTMLVideoElement(videoRef.current);

      player.current.addEventListener(READY, onStateChange);
      player.current.addEventListener(PLAYING, onStateChange);
      player.current.addEventListener(ENDED, onStateChange);
      player.current.addEventListener(ERROR, onError);

      return () => {
        player.current?.removeEventListener(READY, onStateChange);
        player.current?.removeEventListener(PLAYING, onStateChange);
        player.current?.removeEventListener(ENDED, onStateChange);
        player.current?.removeEventListener(ERROR, onError);
      };
    }
  }, []);

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
        <Button onClick={nextStream}>ChevronUp</Button>
        <Button onClick={prevStream}>ChevronDown</Button>

        <span className="description-toggle">
          <hr className="divider" />
          <Button onClick={() => toggleMetadata()}>Description</Button>
        </span>
      </div>

      <div className="player-video">
        <video ref={videoRef} onClick={togglePlayPause} playsInline muted />
        <Placeholder loading={loading} />
        {paused && (
          <div onClick={togglePlayPause} className="paused-player">
            <Button onClick={togglePlayPause}>Play</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
