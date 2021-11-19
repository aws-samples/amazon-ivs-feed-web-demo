import React from 'react';

import Button from '../../../common/Button';
import Like from '../../like';

import './PlayerControls.css';

const PlayerControls = ({ muted, toggleMute, toggleMetadata, setSwipeDirection }) => (
  <div className="player-buttons">
    <Like />
    <Button onClick={() => toggleMute()}>{muted ? 'VolumeOff' : 'VolumeUp'}</Button>
    <hr className="divider" />
    <Button id="prev-stream" onClick={() => setSwipeDirection('prev')}>
      ChevronUp
    </Button>
    <Button id="next-stream" onClick={() => setSwipeDirection('next')}>
      ChevronDown
    </Button>
    <span className="metadata-toggle">
      <hr className="divider" />
      <Button onClick={() => toggleMetadata()}>Description</Button>
    </span>
  </div>
);

export default PlayerControls;
