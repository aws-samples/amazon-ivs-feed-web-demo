import React, { useEffect, useState, useRef } from 'react';
import { getTimeSince } from '../utils';
import { ReactComponent as ReactLogo } from "../../../assets/icons/copy.svg";

import './StreamMetadata.css';

const StreamMetadata = ({ active, startTime, userAvatar, userName, state, streamTitle }) => { 

  const [timeSince, setTimeSince] = useState(getTimeSince(startTime));
  const intervalId = useRef(null);

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

  return (
    <div className="metadata-content">
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
        <div className="stream-meta-sharelink">https://myurl.com/item1 <ReactLogo /></div>
      </div>
    </div>
  );
};

export default StreamMetadata;
