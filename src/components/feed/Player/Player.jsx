import { useEffect, useCallback } from 'react';
import 'context-filter-polyfill';

import PlayerControls from './PlayerControls';
import Spinner from '../../common/Spinner';
import { Play } from '../../../assets/icons';

import usePlayer from '../../hooks/usePlayer';
import { isElementInViewport } from '../utils';

import './Player.css';

/**
 * Props:
 * @param {number} id   Player ID
 * @param {string} type 'ACTIVE' | 'NEXT' | 'PREV'
 * @param {boolean} isActive true if type is 'ACTIVE'; false otherwise
 * @param {string} playbackUrl stream URL to load into the player for playback
 * @param {function toggleMetadata(): void} toggleMetadata toggles metadata panel in mobile view
 */
const Player = ({ id, type, playbackUrl, isActive, toggleMetadata }) => {
  const {
    pid,
    video,
    load,
    muted,
    paused,
    loading,
    toggleMute,
    play,
    pause,
    togglePlayPause,
    player,
    log
  } = usePlayer(id);

  useEffect(() => {
    if (playbackUrl) load(playbackUrl, isActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackUrl]);

  useEffect(() => (isActive ? play() : pause()), [isActive, pause, play]);

  const attachBlur = useCallback(
    (canvas) => {
      if (
        canvas &&
        isElementInViewport(canvas) &&
        player?.getState() === window.IVSPlayer.PlayerState.PLAYING
      ) {
        const ctx = canvas.getContext('2d');
        ctx.filter = 'blur(3px)';

        // log('attachBlur', canvas);

        // requestAnimationFrame(function draw() {
        //   ctx.drawImage(video.current, 0, 0, canvas.width, canvas.height);

        //   requestAnimationFrame(draw);
        // });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [type, player]
  );

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    <div id={`${type.toLowerCase()}-player-${pid}`} className="player-container">
      <PlayerControls
        muted={muted}
        toggleMute={toggleMute}
        toggleMetadata={toggleMetadata}
      />
      <div className="player-video">
        <video id={`${type.toLowerCase()}-video`} ref={video} playsInline muted />
        <canvas id={`${type.toLowerCase()}-blur`} ref={attachBlur} />

        <Spinner loading={loading && !paused && isActive} />
        <div
          className={`btn-play-pause ${isActive ? 'active' : ''}`}
          onClick={() => togglePlayPause()}
          tabIndex={1}
        >
          {!loading && paused && isActive && <Play className="btn-play" />}
        </div>
      </div>
    </div>
  );
};

export default Player;
