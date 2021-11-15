import { useEffect } from 'react';
import 'context-filter-polyfill';

import PlayerControls from './PlayerControls';
import Spinner from '../../common/Spinner';
import { Play } from '../../../assets/icons';

import usePlayer from '../../hooks/usePlayer';

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
    destroy,
    muted,
    paused,
    loading,
    toggleMute,
    play,
    pause,
    togglePlayPause
  } = usePlayer(id);

  useEffect(() => {
    if (playbackUrl) {
      load(playbackUrl, isActive);
      return () => destroy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackUrl]);

  useEffect(() => (isActive ? play() : pause()), [isActive, pause, play]);

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
