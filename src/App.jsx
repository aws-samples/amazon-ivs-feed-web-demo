import React, { useCallback, useEffect, useRef, useState } from 'react';

import Feed from './components/feed';
import StreamMetadata from './components/feed/StreamMetadata';

import useStream from './contexts/Stream/useStream';
import useMobileBreakpoint from './contexts/MobileBreakpoint/useMobileBreakpoint';
import { useParams } from 'react-router-dom';

import './App.css';

const feedJSON = `${process.env.PUBLIC_URL}/feed.json`;

const App = () => {
  const { isMobileView } = useMobileBreakpoint();
  const { activeStream, setStreams } = useStream();

  const [metadataVisible, setMetadataVisible] = useState(true);
  const metadataRef = useRef();
  const params = useParams();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await fetch(feedJSON);
        if (response.ok) {
          const { streams } = await response.json();
          const paramsStreamId = parseInt(params.id);
          const streamIds = streams.map((s) => s.id);
          const initialStreamId = streamIds.includes(paramsStreamId) ? paramsStreamId : 0;
          setStreams(streams, initialStreamId);
        } else throw new Error(response.statusText);
      } catch (e) {
        console.error(e);
      }
    };

    fetchStreams();
  }, [setStreams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update the page URL for the active stream
  useEffect(() => {
    const activeStreamId = activeStream?.data.id;
    if (activeStream && activeStreamId !== params.id) {
      const obj = { Page: activeStreamId, Url: activeStreamId };
      window.history.pushState(obj, obj.Page, obj.Url);
    }
  }, [activeStream, params.id]);

  useEffect(() => toggleMetadata(!isMobileView, false), [isMobileView]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMetadata = useCallback(
    (show = !metadataVisible, transition = true) => {
      if (metadataRef.current) {
        const { scrollHeight: contentHeight, style } = metadataRef.current;
        style.transition = transition ? 'height 0.2s ease-out' : '';

        if (show) {
          // Show metadata
          style.height = isMobileView ? `${contentHeight}px` : '100%';
          metadataRef.current.addEventListener(
            'transitionend',
            () => (style.height = null),
            { once: true }
          );
        } else {
          // Hide metadata
          if (transition) {
            requestAnimationFrame(() => {
              style.height = `${contentHeight}px`;
              requestAnimationFrame(() => (style.height = '0'));
            });
          } else style.height = '0';
        }

        setMetadataVisible(show);
      }
    },
    [metadataVisible, isMobileView]
  );

  return (
    <div className="grid">
      <div className="feed">
        <Feed toggleMetadata={toggleMetadata} metadataVisible={metadataVisible} />
      </div>
      <div className="metadata" ref={metadataRef}>
        <StreamMetadata toggleMetadata={toggleMetadata} />
      </div>
    </div>
  );
};

export default App;
