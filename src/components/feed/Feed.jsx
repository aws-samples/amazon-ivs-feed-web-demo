import React, { useEffect, useRef, useMemo, useLayoutEffect, useCallback } from 'react';

import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Like from './like';
import { Play } from '../../assets/icons';

import useStream from '../../contexts/Stream/useStream';
import usePlayer from '../hooks/usePlayer';
import useThrottledCallback from '../hooks/useThrottledCallback';

import './Feed.css';

const Feed = ({ toggleMetadata }) => {
  const { activeStream, setActiveStream } = useStream();
  const players = [usePlayer(1), usePlayer(2), usePlayer(3)];
  const loadedStreamsMap = useMemo(() => new Map(), []); // key: Player ID (PID), value: loaded stream node

  const activePlayer = players.reduce((activePlayer, currentPlayer) => {
    const loadedStream = loadedStreamsMap.get(currentPlayer.pid);
    if (loadedStream) {
      if (loadedStream.data.id === activeStream.data.id) {
        return currentPlayer;
      }
    }
    return activePlayer;
  }, players[0]);

  const throttledGotoNextStream = useThrottledCallback(
    () => setActiveStream(activeStream.next),
    500
  );
  const throttledGotoPrevStream = useThrottledCallback(
    () => setActiveStream(activeStream.prev),
    500
  );

  useLayoutEffect(() => {
    if (activeStream) {
      const streams = [activeStream, activeStream.next, activeStream.prev];

      players.forEach((player) => {
        const loadedStream = loadedStreamsMap.get(player.pid);
        const isLoaded = (stream) =>
          loadedStream && loadedStream.data.id === stream.data.id;

        if (isLoaded(activeStream)) {
          player.instance.play();
        } else if (isLoaded(activeStream.next) || isLoaded(activeStream.prev)) {
          player.instance.pause();
        } else {
          const loadedStreamIds = [...loadedStreamsMap].map(
            ([_, stream]) => stream.data.id
          );
          const streamToPreload = streams.find(
            (stream) => !loadedStreamIds.includes(stream.data.id)
          );
          const {
            id,
            stream: { playbackUrl }
          } = streamToPreload.data;

          player.instance.load(playbackUrl);
          loadedStreamsMap.set(player.pid, streamToPreload);

          if (id === activeStream.data.id) {
            // preloaded stream is active
            player.instance.play();
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 38) throttledGotoPrevStream(); // keyCode 38 : 'ArrowUp'
      if (e.keyCode === 40) throttledGotoNextStream(); // keyCode 38 : 'ArrowDown'
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [throttledGotoNextStream, throttledGotoPrevStream]);

  const blurredPlayerId = useRef(null);
  const attachBlur = useCallback(
    (canvas) => {
      if (activePlayer && canvas) {
        blurredPlayerId.current = activePlayer.pid;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'blur(3px)';

        const draw = (bid) => {
          if (blurredPlayerId.current !== bid) return;

          ctx.drawImage(activePlayer.video.current, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(() => draw(bid));
        };
        requestAnimationFrame(() => draw(blurredPlayerId.current));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activePlayer.pid]
  );

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    <div className="feed-content">
      <div className="player-buttons">
        <Like />
        <Button onClick={activePlayer.toggleMute}>
          {activePlayer.muted ? 'VolumeOff' : 'VolumeUp'}
        </Button>

        <hr className="divider" />
        <Button onClick={throttledGotoPrevStream}>ChevronUp</Button>
        <Button onClick={throttledGotoNextStream}>ChevronDown</Button>

        <span className="metadata-toggle">
          <hr className="divider" />
          <Button onClick={() => toggleMetadata()}>Description</Button>
        </span>
      </div>

      <div className="player-video">
        {players.map(({ pid, video }) => (
          <video
            key={pid}
            ref={video}
            style={{ display: pid === activePlayer.pid ? 'block' : 'none' }}
            playsInline
            muted
          />
        ))}
        <canvas ref={attachBlur} />

        <Spinner loading={activePlayer.loading && !activePlayer.paused} />

        <button
          className="btn-play-pause"
          onClick={activePlayer.togglePlayPause}
          tabIndex={1}
        >
          {!activePlayer.loading && activePlayer.paused && <Play className="btn-play" />}
        </button>
      </div>
    </div>
  );
};

export default Feed;
