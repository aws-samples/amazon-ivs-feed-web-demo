import React from 'react';

import PlayerControls from './PlayerControls';
import Spinner from '../../common/Spinner';
import { Play } from '../../../assets/icons';

import './Player.css';

const Player = ({ playerData, isActive, toggleMetadata }) => {
  const { video, loading, paused, togglePlayPause } = playerData;

  return (
    <div className={`player-container${isActive ? ' active' : ''}`}>
      <PlayerControls playerData={playerData} toggleMetadata={toggleMetadata} />
      <div className="player-video">
        <video ref={video} playsInline muted />
        <Spinner loading={loading && !paused && isActive} />
        <button className="btn-play-pause" onClick={() => togglePlayPause()} tabIndex={1}>
          {!loading && paused && isActive && <Play className="btn-play" />}
        </button>
      </div>
    </div>
  );
};

export default Player;
