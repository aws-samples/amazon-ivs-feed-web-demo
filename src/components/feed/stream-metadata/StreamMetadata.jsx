import React, { useEffect, useState, useRef } from 'react';
import { getTimeSince } from '../utils';
import { Copy } from '../../../assets/icons';

import useStream from '../../../contexts/Stream/useStream';
import Snackbar from '../snackbar/Snackbar';

import './StreamMetadata.css';
import Button from '../../common/Button';

const StreamMetadata = ({ toggleMetadata }) => {
  const { activeStream } = useStream();

  const { startTime, state } = activeStream.stream;
  const { userAvatar, userName, streamTitle } = activeStream.metadata;
  const intervalId = useRef(null);
  const [timeSince, setTimeSince] = useState(getTimeSince(startTime));
  const [showSnackbar, setSnackbar] = useState(false);
  const currentURL = `${window.location.origin}/${activeStream.id}`;

  const isIOS = () => {
    return navigator.userAgent.match(/ipad|iphone/i);
  };

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

    state === "LIVE" ? startCounter() : pauseCounter();

    return () => {
      if (intervalId.current) pauseCounter();
    };
  }, [startTime, timeSince]);

  const copyText = (url) => {
    if (isIOS()) {
      //copy to clipboard for iOS safari
      let textArea = document.createElement('textArea');
      textArea.value = url;
      textArea.readOnly = true;
      document.body.appendChild(textArea);

      let range = document.createRange();
      range.selectNodeContents(textArea);
      let selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      textArea.setSelectionRange(0, 999999);

      document.execCommand('copy');
      document.body.removeChild(textArea);
    } else {
      navigator.clipboard.writeText(url);
    }
    setSnackbar(true);
    setTimeout(() => {
      setSnackbar(false);
    }, 2000);
  };
  return (
    <div className="metadata-content">
      <div className="stream-meta-close">
        <Button onClick={() => toggleMetadata()}>Cross</Button>
      </div>
      <div className="stream-meta-details">
        <img className="stream-meta-avatar" src={userAvatar} alt={`${userName} avatar`} />

        <div className="stream-meta-text">
          <p className="stream-meta-username">{userName}</p>

          <span className="stream-meta-state">{`${state} for ${timeSince}`}</span>
        </div>
      </div>
      <div className="stream-meta-title">{streamTitle}</div>

      <div className="stream-meta-share">
        Share this live stream
        <div className="stream-meta-sharelink">
          {currentURL}
          <button onClick={() => copyText(currentURL)}>
            <Copy />
          </button>
        </div>
      </div>
      <Snackbar showSnackbar={showSnackbar} text="Copied!" />
    </div>
  );
};

export default StreamMetadata;
