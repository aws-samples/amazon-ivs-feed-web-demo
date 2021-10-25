import React, { useEffect, useState, useRef } from 'react';
import { getTimeSince } from '../utils';

import './StreamMetadata.css';

const StreamMetadata = (props) => {
  const { active, startTime, state, title, userAvatar, userName } = props;

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
    // <div className="stream-meta">
    //   <h3 className="stream-meta-title">{title}</h3>

    //   <div className="stream-meta-details">
    //     <img
    //       className="stream-meta-avatar"
    //       src={userAvatar}
    //       alt={`${userName} avatar`}
    //     />

    //     <div className="stream-meta-text">
    //       <p className="stream-meta-username">{userName}</p>

    //       <p className="stream-meta-state">
    //         <span>{state}</span> for {timeSince}
    //       </p>
    //     </div>
    //   </div>
    // </div>
    <div className="metadata-content">
      <p>Metadata</p>
      <p>Metadata</p>
      <p>Metadata</p>
    </div>
  );
};

export default StreamMetadata;
