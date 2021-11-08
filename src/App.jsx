/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Feed from './components/feed';
import StreamMetadata from './components/feed/stream-metadata';
import useStream from './contexts/Stream/useStream';
import { useParams } from 'react-router-dom';

import './App.css';

const feedJSON = `${process.env.PUBLIC_URL}/feed.json`;

const App = () => {
  const { streams, activeStream, setStreams, setActiveStreamById } = useStream();
  const [metadataVisible, setMetadataVisible] = useState(true);
  const isMobileView = useRef(false);
  const metadataRef = useRef();
  const params = useParams();

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await fetch(feedJSON);
        if (response.ok) {
          const data = await response.json();
          setStreams(data.streams);
        } else throw new Error(response.statusText);
      } catch (e) {
        console.error(e);
      }
    };

    fetchStreams();
  }, [setStreams]);

  // Set the active stream to the matching stream ID in the URL params, if one exists
  useEffect(() => {
    const activeStreamId = activeStream?.data.id;
    const paramsStreamId = parseInt(params.id);
    if (streams && streams.size && activeStreamId !== paramsStreamId) {
      const streamIds = streams.map((s) => s.id);
      const id = streamIds.includes(paramsStreamId) ? paramsStreamId : 0;
      setActiveStreamById(id);
    }
  }, [streams]);

  // Update the page URL for the active stream
  useEffect(() => {
    const activeStreamId = activeStream?.data.id;
    if (activeStream && activeStreamId !== params.id) {
      const obj = { Page: activeStreamId, Url: activeStreamId };
      window.history.pushState(obj, obj.Page, obj.Url);
    }
  }, [activeStream]);

  useEffect(() => {
    const handleWindowResize = () => {
      if (window.innerWidth < 840 && !isMobileView.current) {
        // Switch to mobile view
        isMobileView.current = true;
        toggleMetadata(false, false);
      }
      if (window.innerWidth >= 840 && isMobileView.current) {
        // Switch to desktop view
        isMobileView.current = false;
        toggleMetadata(true, false);
      }
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const toggleMetadata = useCallback(
    (show = !metadataVisible, transition = true) => {
      if (metadataRef.current) {
        const { scrollHeight: contentHeight, style } = metadataRef.current;
        style.transition = transition ? 'height 0.2s ease-out' : '';

        if (show) {
          // Show metadata
          style.height = isMobileView.current ? `${contentHeight}px` : '100%';
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
    [metadataVisible]
  );

  return (
    <div className="grid">
      <div className="feed">
        <Feed toggleMetadata={toggleMetadata} />
      </div>
      {!!activeStream && (
        <div ref={metadataRef} className="metadata">
          <StreamMetadata toggleMetadata={toggleMetadata} />
        </div>
      )}
    </div>
  );
};

export default App;
