import React from 'react';

import Button from '../../../common/Button';
import Like from '../../like';

import useStream from '../../../../contexts/Stream/useStream';

import './PlayerControls.css';

const PlayerControls = ({ muted, toggleMute, toggleMetadata }) => {
  const { throttledGotoNextStream, throttledGotoPrevStream } = useStream();

  return (
    <div className="player-buttons">
      <Like />
      <Button onClick={() => toggleMute()}>{muted ? 'VolumeOff' : 'VolumeUp'}</Button>
      <hr className="divider" />
      <Button id="prev-stream" onClick={throttledGotoPrevStream}>
        ChevronUp
      </Button>
      <Button id="next-stream" onClick={throttledGotoNextStream}>
        ChevronDown
      </Button>
      <span className="metadata-toggle">
        <hr className="divider" />
        <Button onClick={() => toggleMetadata()}>Description</Button>
      </span>
    </div>
  );
};

export default PlayerControls;
