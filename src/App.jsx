import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Feed from './components/feed';
import StreamMetadata from './components/feed/stream-metadata';
import useStream from './contexts/Stream/useStream';

import './App.css';

const feedJSON = `${process.env.PUBLIC_URL}/feed.json`;

const App = () => {
  const { setStreams, activeStream } = useStream();
  const [metadataVisible, setMetadataVisible] = useState(true);
  const isMobileView = useRef(false);
  const metadataRef = useRef();
  const location = useLocation();

  // function hideAddressBar(bPad) {
  //   // Big screen. Fixed chrome likely.
  //   if(screen.width > 980 || screen.height > 980) return;
  
  //   // Standalone (full screen webapp) mode
  //   if(window.navigator.standalone === true) return;
  
  //   // Page zoom or vertical scrollbars
  //   if(window.innerWidth !== document.documentElement.clientWidth) {
  //     // Sometimes one pixel too much. Compensate.
  //     if((window.innerWidth - 1) !== document.documentElement.clientWidth) return;
  
  //   }
  
  //   setTimeout(function() {
  //     // Already scrolled?
  //     if(window.pageYOffset !== 0) return;
  
  //     // Perform autoscroll
  //     window.scrollTo(0, 1);
  
  //     // Reset body height and scroll
  //     if(bodyTag !== undefined) bodyTag.style.height = window.innerHeight + 'px';
  //     window.scrollTo(0, 0);
  
  //   }, 1000);
  
  // }

  useEffect(() => {
    // quickHideAddressBar();
    // /mobile/i.test(navigator.userAgent) && !location.hash && setTimeout(function() {
      window.scrollTo(0, 1);
    // }, 1000);
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Feed toggleMetadata={toggleMetadata} />
      {!!activeStream && 
        <div ref={metadataRef} className="metadata">
          <StreamMetadata />
        </div>
      }
    </div>
  );
}

export default App;
