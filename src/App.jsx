import React, { useCallback, useEffect, useRef, useState } from 'react';
import Feed from './components/feed';
import StreamMetadata from './components/feed/stream-metadata';
import { Description } from './assets/icons';

import './App.css';

const feedJSON = `${process.env.PUBLIC_URL}/feed.json`;

const App = () => {
  const [streams, setStreams] = useState([]);

  const [metadataVisible, setMetadataVisible] = useState(true);
  const isMobileView = useRef(false);
  const metadataRef = useRef();

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
  }, []);

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
        toggleMetadata(true);
      }
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMetadata = useCallback(
    (show = !metadataVisible, transition = true) => {
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
    },
    [metadataVisible]
  );

  return (
    <div className="grid">
      <div className="feed">
        <button className="desc-button" onClick={() => toggleMetadata()}>
          <Description />
        </button>
        {!!streams.length && <Feed streams={[streams[0]]} />}
      </div>
      <div ref={metadataRef} className="metadata">
        <StreamMetadata />
      </div>
    </div>
  );
};

export default App;
