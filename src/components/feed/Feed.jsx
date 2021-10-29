import React, { useEffect, useRef, useMemo, useLayoutEffect } from 'react';

import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Like from './like';
import { Play } from '../../assets/icons';

import useStream from '../../contexts/Stream/useStream';
import usePlayer from '../hooks/usePlayer';

import './Feed.css';

const Feed = ({ toggleMetadata }) => {
  const { activeStream, nextStream, prevStream, gotoNextStream, gotoPrevStream } =
    useStream();
  const [v1, v2, v3] = [useRef(1), useRef(2), useRef(3)];
  const players = [usePlayer(v1), usePlayer(v2), usePlayer(v3)];
  const streamPlayerMap = useMemo(() => new Map(), []);
  const activePlayer =
    players.find(({ instance }) => instance && !instance.isPaused()) || players[0];

  const init = useRef(true);
  useEffect(() => {
    if (activeStream && nextStream && prevStream) {
      const streams = [activeStream, nextStream, prevStream];

      // init: preload players with initial streams
      if (init.current) {
        players.forEach((player, i) => {
          const { id, stream } = streams[i];
          player.preload(stream.playbackUrl);
          streamPlayerMap.set(id, player);
        });
        players[0].instance.play();
        init.current = false;
        return;
      }

      // transition players to the next state

      let nextActivePlayer, previousActivePlayer, preloadPlayer, unloadedStreamId;
      streamPlayerMap.forEach((player, streamId, map) => {
        if (streamId === activeStream.id) {
          nextActivePlayer = player;
        } else if (streamId === nextStream.id || streamId === prevStream.id) {
          previousActivePlayer = player;
        } else {
          preloadPlayer = player;
          unloadedStreamId = streamId;
        }
      });

      // pause the previously active player
      previousActivePlayer.instance.pause();

      // play the next active player
      nextActivePlayer.instance.play();

      // preload and pause the thrid player for the new/unloaded stream
      const streamToPreload = streams.find((s) => !streamPlayerMap.has(s.id));
      preloadPlayer.preload(streamToPreload.stream.playbackUrl);
      streamPlayerMap.set(streamToPreload.id, preloadPlayer);
      streamPlayerMap.delete(unloadedStreamId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.keyCode === 38) gotoPrevStream(); // keyCode 38 : 'ArrowUp'
      if (e.keyCode === 40) gotoNextStream(); // keyCode 38 : 'ArrowDown'
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [gotoNextStream, gotoPrevStream]);

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  console.log(
    !activePlayer.loading && activePlayer.instance && activePlayer.instance.isPaused()
  );

  return (
    <div className="feed-content">
      <div className="player-buttons">
        <Like />
        <Button onClick={activePlayer.toggleMute}>
          {activePlayer.muted ? 'VolumeOff' : 'VolumeUp'}
        </Button>

        <hr className="divider" />
        <Button onClick={gotoPrevStream}>ChevronUp</Button>
        <Button onClick={gotoNextStream}>ChevronDown</Button>

        <span className="metadata-toggle">
          <hr className="divider" />
          <Button onClick={() => toggleMetadata()}>Description</Button>
        </span>
      </div>

      <div className="player-video">
        {players.map(({ pid, instance, video }) => {
          const isVisible = instance && !instance.isPaused();
          const style = { display: isVisible ? 'block' : 'none' };
          return <video key={pid} ref={video} style={style} playsInline muted />;
        })}
        <canvas ref={activePlayer.canvas} />

        <Spinner loading={activePlayer.loading && !activePlayer.paused} />

        <button className="btn-pause" onClick={activePlayer.togglePlayPause} tabIndex={1}>
          {!activePlayer.loading && activePlayer.paused && <Play />}
        </button>
      </div>
    </div>
  );
};

export default Feed;
