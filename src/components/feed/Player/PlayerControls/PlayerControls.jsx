import React, { useEffect, useRef } from 'react';

import Button from '../../../common/Button';
import Like from '../../Like';

import config from '../../../../config';

import './PlayerControls.css';

const PlayerControls = ({
  muted,
  hidden,
  toggleMute,
  gotoStream,
  toggleMetadata,
  metadataVisible,
  isPlayerVisible
}) => {
  const nextEl = useRef();
  const prevEl = useRef();

  useEffect(() => {
    if (isPlayerVisible) {
      const activeElemId = document.activeElement.id;
      setTimeout(() => {
        if (activeElemId === 'next-stream') nextEl.current.focus();
        if (activeElemId === 'prev-stream') prevEl.current.focus();
      }, config.SWIPE_DURATION);
    }
  }, [isPlayerVisible]);

  return (
    !hidden && (
      <div className="player-buttons">
        <Like />
        <Button onClick={() => toggleMute()}>{muted ? 'VolumeOff' : 'VolumeUp'}</Button>
        <hr className="divider" />
        <Button ref={prevEl} id="prev-stream" onClick={() => gotoStream('prev')}>
          ChevronUp
        </Button>
        <Button ref={nextEl} id="next-stream" onClick={() => gotoStream('next')}>
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
