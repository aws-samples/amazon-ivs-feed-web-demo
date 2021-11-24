import React, { useEffect, useState, useRef } from 'react';
import { getTimeSince } from '../../../utils';
import { Copy } from '../../../assets/icons';

import useStream from '../../../contexts/Stream/useStream';
import Snackbar from '../Snackbar';

import './StreamMetadata.css';
import Button from '../../common/Button';

const StreamMetadata = ({ toggleMetadata }) => {
  const { activeStream } = useStream();
  const [timeSince, setTimeSince] = useState(0);
  const [showSnackbar, setSnackbar] = useState(false);

  const currentURL = `${window.location.origin}/${activeStream?.data.id || '0'}`;

  const intervalId = useRef(null);
  useEffect(() => {
    if (activeStream) {
      const { startTime, state } = activeStream.data.stream;

      const pauseCounter = () => {
        clearInterval(intervalId.current);
        intervalId.current = null;
      };

      const startCounter = () => {
        intervalId.current = setInterval(() => {
          setTimeSince(() => getTimeSince(startTime));
        }, 1000);
      };

      state === 'LIVE' ? startCounter() : pauseCounter();

      return () => {
        if (intervalId.current) pauseCounter();
      };
    }
  }, [activeStream, timeSince]); // eslint-disable-line react-hooks/exhaustive-deps

  const copyText = (url) => {
    const isIOS = navigator.userAgent.match(/ipad|iphone/i);

    if (isIOS) {
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
    !!activeStream && (
      <div className="metadata-content">
        <div className="stream-meta-close">
          <Button onClick={() => toggleMetadata()}>Cross</Button>
        </div>
        <div className="stream-meta-details">
          <img
            className="stream-meta-avatar"
            src={activeStream.data.metadata.userAvatar}
            alt={`${activeStream.data.metadata.userName} avatar`}
          />

          <div className="stream-meta-text">
            <p className="stream-meta-username">{activeStream.data.metadata.userName}</p>
            <span className="stream-meta-state">{`${activeStream.data.stream.state} for ${timeSince}`}</span>
          </div>
        </div>
        <div className="stream-meta-title">{activeStream.data.metadata.streamTitle}</div>

        <div className="stream-meta-share">
          Share this live stream
          <div className="stream-meta-sharelink">
            <span className="stream-meta-url">{currentURL}</span>
            <button aria-label="Share" onClick={() => copyText(currentURL)}>
              <Copy />
            </button>
          </div>
        </div>
        <Snackbar showSnackbar={showSnackbar} text="Copied!" />
      </div>
    )
  );
};

export default StreamMetadata;
