import React, { useEffect, useRef, useCallback } from 'react';

import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Like from './like';
import { Play } from '../../assets/icons';

import useStream from '../../contexts/Stream/useStream';
import usePlayer from '../hooks/usePlayer';
import useThrottledCallback from '../hooks/useThrottledCallback';

import { sort } from './utils';

import './Feed.css';

const PLAYER_NAMES = Object.freeze(['PREV', 'ACTIVE', 'NEXT']);

const Feed = ({ toggleMetadata }) => {
  const { activeStream, setActiveStream } = useStream();
  const players = [usePlayer(), usePlayer(), usePlayer()];
  const actionTriggered = useRef(null);

  sort(players, ['name'], PLAYER_NAMES);
  const [prevPlayer, activePlayer, nextPlayer] = players;

  const throttledGotoNextStream = useThrottledCallback(() => {
    setActiveStream(activeStream.next);
    actionTriggered.current = 'next';
  }, 500);

  const throttledGotoPrevStream = useThrottledCallback(() => {
    setActiveStream(activeStream.prev);
    actionTriggered.current = 'prev';
  }, 500);

  useEffect(() => {
    if (activeStream) {
      const streams = [activeStream.prev, activeStream, activeStream.next];
      const playbackUrls = streams.map(({ data }) => data.stream.playbackUrl);
      const [prevPlaybackUrl, activePlaybackUrl, nextPlaybackUrl] = playbackUrls;
      activePlayer.togglePlayPause('pause');

      switch (actionTriggered.current) {
        case 'next': {
          /**                   Prev   Active  Next
           * Initial Players: [ P1,    P2,     P3 ]
           * Final Players:   [ P2,    P3,     newP1 ]
           */
          nextPlayer.togglePlayPause('play');
          const newNextPlayer = players.shift(); // [P2, P3]
          newNextPlayer.load(nextPlaybackUrl); // P1.load(url) -> newP1
          players.push(newNextPlayer); // [P2, P3, newP1]
          break;
        }
        case 'prev': {
          /**                   Prev     Active  Next
           * Initial Players: [ P1,      P2,     P3 ]
           * Final PLayers:   [ newP3,   P1,     P2 ]
           */
          prevPlayer.togglePlayPause('play');
          const newPrevPlayer = players.pop(); // [P1, P2]
          newPrevPlayer.load(prevPlaybackUrl); // P3.load(url) -> newP3
          players.unshift(newPrevPlayer); // [newP3, P1, P2]
          break;
        }
        default: {
          /**                   Prev     Active  Next
           * Initial Players: [ P1,      P2,     P3 ]
           * Final Players:   [ newP1,   newP2,  newP3 ]
           */
          prevPlayer.load(prevPlaybackUrl); // P1.load(url) -> newP1
          activePlayer.load(activePlaybackUrl, true); // P2.load(url) -> newP2
          nextPlayer.load(nextPlaybackUrl); // P3.load(url) -> newP3
        }
      }

      PLAYER_NAMES.forEach((name, i) => players[i].setName(name)); // Rename players according to their new positions
      actionTriggered.current = null;
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
      if (activeStream && canvas) {
        const player = players.find((p) => p.pid === canvas.id);
        console.log('attachBlur', player);

        // blurredPlayerId.current = activePlayer.pid;
        // const ctx = canvas.getContext('2d');
        // ctx.filter = 'blur(3px)';

        // const draw = (bid) => {
        //   if (blurredPlayerId.current !== bid) return;

        //   ctx.drawImage(activePlayer.video.current, 0, 0, canvas.width, canvas.height);
        //   requestAnimationFrame(() => draw(bid));
        // };
        // requestAnimationFrame(() => draw(blurredPlayerId.current));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeStream]
  );

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    activePlayer && (
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
          {players.map(({ video, pid, name }) => (
            <React.Fragment key={`player-${pid}`}>
              <video
                id={`${name}-player}`}
                style={{ display: name === 'ACTIVE' ? 'block' : 'none' }} // temporary
                ref={video}
                playsInline
                muted
              />
              <canvas id={pid} ref={attachBlur} />
            </React.Fragment>
          ))}

          <Spinner loading={activePlayer.loading && !activePlayer.paused} />

          <button
            className="btn-play-pause"
            onClick={() => activePlayer.togglePlayPause()}
            tabIndex={1}
          >
            {!activePlayer.loading && activePlayer.paused && (
              <Play className="btn-play" />
            )}
          </button>
        </div>
      </div>
    )
  );
};

export default Feed;
