import React from 'react';

import Button from '../../../common/Button';
import Like from '../../Like';

import useMobileBreakpoint from '../../../../contexts/MobileBreakpoint/useMobileBreakpoint';

import './PlayerControls.css';

const PlayerControls = ({
  muted,
  toggleMute,
  gotoStream,
  toggleMetadata,
  metadataVisible
}) => {
  const { isMobileView } = useMobileBreakpoint();

  return (
    (!metadataVisible || !isMobileView) && (
      <div className="player-buttons">
        <Like />
        <Button onClick={() => toggleMute()}>{muted ? 'VolumeOff' : 'VolumeUp'}</Button>
        <hr className="divider" />
        <Button id="prev-stream" onClick={() => gotoStream('prev')}>
          ChevronUp
        </Button>
        <Button id="next-stream" onClick={() => gotoStream('next')}>
          ChevronDown
        </Button>
        <span className="metadata-toggle">
          <hr className="divider" />
          <Button onClick={() => toggleMetadata()}>Description</Button>
        </span>
      </div>
    )
  );
};

export default PlayerControls;
