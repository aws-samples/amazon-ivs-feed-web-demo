import React, { useEffect, useState, useRef } from 'react';
import { getTimeSince } from '../utils';
import { Cross, Copy } from '../../../assets/icons';

import useStream from '../../../contexts/Stream/useStream';
import Snackbar from '../snackbar/Snackbar';

import './StreamMetadata.css';
import Button from '../../common/Button';

const StreamMetadata = ({ toggleMetadata }) => { 
  const { activeStream } = useStream();

  const { active, startTime, state } = activeStream.stream;
  const { userAvatar, userName, streamTitle } = activeStream.metadata;
  const [timeSince, setTimeSince] = useState(getTimeSince(startTime));
  const intervalId = useRef(null);
  const [showSnackbar, setSnackbar] = useState(false);

  useEffect(() => {
    const pauseCounter = () => {
      clearInterval(intervalId.current);
      intervalId.current = null;
    };

    const startCounter = () => {
      intervalId.current = setInterval(() => {
        setTimeSince(() => getTimeSince(startTime));
      }, 1000);
    };

    active ? startCounter() : pauseCounter();

    return () => {
      if (intervalId.current) pauseCounter();
    };
  }, [active, startTime]);

  const copyText = (testUrl) => {
    navigator.clipboard.writeText(testUrl);
    setSnackbar(true);
    setTimeout(() => {
      setSnackbar(false);
    }, 2000);
  }
  
  return (
    <div className="metadata-content">
      <div className="stream-meta-close">
        <Button onClick={() => toggleMetadata()}>Cross</Button>
      </div>
      <div className="stream-meta-details">
        <img
          className="stream-meta-avatar"
          src={userAvatar}
          alt={`${userName} avatar`}
        />

        <div className="stream-meta-text">
          <p className="stream-meta-username">{userName}</p>

          <p className="stream-meta-state">
            <span>{state}</span> for {timeSince}
          </p>
        </div>
      </div>
      <div className="stream-meta-title">{streamTitle}</div>

      <div className="stream-meta-share">
        Share this live stream
        <div className="stream-meta-sharelink">
          https://myurl.com/item1
          <button onClick={() => copyText("https://myurl.com/item1")}>
            <Copy />
          </button>
        </div>
      </div>
      <Snackbar showSnackbar={showSnackbar} text="Copied!" />
    </div>
  );
};

export default StreamMetadata;
