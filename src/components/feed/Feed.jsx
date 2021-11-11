import React, { useEffect, useMemo } from 'react';

import Player from './Player';
import useStream from '../../contexts/Stream/useStream';
import usePlayer from '../hooks/usePlayer';

import { shiftObjectValues } from './utils';

import './Feed.css';

const PLAYER_TYPES = Object.freeze(['ACTIVE', 'NEXT', 'PREV']);

const initializePlayersMap = (players) =>
  players.reduce(
    (playersMap, { pid }, i) => ({
      ...playersMap,
      [pid]: PLAYER_TYPES[i]
    }),
    {}
  );

const Feed = ({ toggleMetadata }) => {
  const {
    activeStream,
    actionTriggered,
    throttledGotoNextStream,
    throttledGotoPrevStream
  } = useStream();
  const players = [usePlayer(1), usePlayer(2), usePlayer(3)];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const playersMap = useMemo(() => initializePlayersMap(players), []); // { key: Player PID, value: PLAYER_TYPE }

  useEffect(() => {
    if (activeStream) {
      // Streams
      const streams = [activeStream, activeStream.next, activeStream.prev];
      const [activePlaybackUrl, nextPlaybackUrl, prevPlaybackUrl] = streams.map(
        ({ data }) => data.stream.playbackUrl
      );
      // Players
      const [activePlayer, nextPlayer, prevPlayer] = PLAYER_TYPES.map((type) =>
        players.find((player) => playersMap[player.pid] === type)
      );

      activePlayer.pause(); // Pause the currently active (and playing) player

      switch (actionTriggered) {
        case 'next': {
          /**
           * Ex.        P1      P2      P3
           * Initial: [ Active  Next    Prev ]
           * Final:   [ Prev    Active  newNext ]
           */
          nextPlayer.play();
          prevPlayer.load(nextPlaybackUrl);
          shiftObjectValues(playersMap, 'down');
          break;
        }
        case 'prev': {
          /**
           * Ex.        P1       P2       P3
           * Initial: [ Active   Next     Prev ]
           * Final:   [ Next     newPrev  Active ]
           */
          prevPlayer.play();
          nextPlayer.load(prevPlaybackUrl);
          shiftObjectValues(playersMap, 'up');
          break;
        }
        default: {
          activePlayer.load(activePlaybackUrl, true);
          nextPlayer.load(nextPlaybackUrl);
          prevPlayer.load(prevPlaybackUrl);
        }
      }
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

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    <div className="feed-content">
      {players.map((player) => (
        <Player
          key={`player-${player.pid}`}
          playerData={player}
          isActive={playersMap[player.pid] === 'ACTIVE'}
          toggleMetadata={toggleMetadata}
        />
      ))}
    </div>
  );
};

export default Feed;
