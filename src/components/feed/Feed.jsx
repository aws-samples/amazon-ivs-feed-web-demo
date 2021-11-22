import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import { Navigation, Keyboard, Mousewheel } from 'swiper';

import Player from './Player';
import useStream from '../../contexts/Stream/useStream';
import useMobileBreakpoint from '../../contexts/MobileBreakpoint/useMobileBreakpoint';

import config from '../../config';
import { isMobileOS } from './utils';

import './Feed.css';

const PLAYER_TYPES = Object.freeze({ ACTIVE: 'ACTIVE', NEXT: 'NEXT', PREV: 'PREV' });
const { SWIPE_DURATION } = config;

const Feed = ({ toggleMetadata, metadataVisible }) => {
  const { activeStream, direction, throttledGotoNextStream, throttledGotoPrevStream } =
    useStream();
  const { isMobileView } = useMobileBreakpoint();
  const [swiper, setSwiper] = useState();

  const [playersData, setPlayersData] = useState([
    { playbackUrl: '', type: PLAYER_TYPES.ACTIVE },
    { playbackUrl: '', type: PLAYER_TYPES.NEXT },
    { playbackUrl: '', type: PLAYER_TYPES.PREV }
  ]);

  useEffect(() => {
    if (activeStream) {
      const [activePlaybackUrl, nextPlaybackUrl, prevPlaybackUrl] = [
        activeStream,
        activeStream.next,
        activeStream.prev
      ].map(({ data }) => data.stream.playbackUrl);

      let newPlayersData = [...playersData];

      if (direction === 'next') {
        newPlayersData.unshift(newPlayersData.pop()); // shift playersData down
      } else if (direction === 'prev') {
        newPlayersData.push(newPlayersData.shift()); // shift playersData up
      }

      newPlayersData = newPlayersData.map((player) => {
        switch (player.type) {
          case PLAYER_TYPES.ACTIVE:
            return { ...player, playbackUrl: activePlaybackUrl };
          case PLAYER_TYPES.NEXT:
            return { ...player, playbackUrl: nextPlaybackUrl };
          case PLAYER_TYPES.PREV:
            return { ...player, playbackUrl: prevPlaybackUrl };
          default:
            return player;
        }
      });

      setPlayersData(newPlayersData);
    }
  }, [activeStream]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentActiveIndex = useRef(null);
  const gotoStream = (swiper, event) =>
    setTimeout(() => {
      const slideChanged = currentActiveIndex.current !== swiper.activeIndex;
      if (slideChanged) {
        if (
          (swiper && swiper.swipeDirection === 'next') || // Touch: swipe up
          event?.wheelDeltaY < 0 || // MouseWheel: vertical scroll up
          event === 40 || // Keyboard: ArrowDown (keyCode 40)
          event === 34 || // Keyboard: PageDown (keyCode 34)
          event === 'next' // Other: directly set swipe direction (i.e. next nav. button)
        ) {
          throttledGotoNextStream();
        } else if (
          (swiper && swiper.swipeDirection === 'prev') || // Touch: swipe down
          event?.wheelDeltaY > 0 || // MouseWheel: vertical scroll down
          event === 38 || // Keyboard: ArrowUp (keyCode 38)
          event === 33 || // Keyboard: PageUp (keyCode 33)
          event === 'prev' // Other: directly set swipe direction (i.e. prev nav. button)
        ) {
          throttledGotoPrevStream();
        }
        currentActiveIndex.current = swiper.activeIndex;
      }
    });

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    !!activeStream &&
    playersData.every(({ playbackUrl }) => !!playbackUrl) && (
      <div className="feed-content">
        <Swiper
          /* swiper config */
          loop
          watchSlidesProgress
          direction={'vertical'}
          simulateTouch={false}
          speed={SWIPE_DURATION}
          preventInteractionOnTransition
          /* slide switching modules config */
          modules={[Keyboard, Navigation, Mousewheel]}
          keyboard
          navigation={{ prevEl: '#prev-stream', nextEl: '#next-stream' }}
          mousewheel={{ forceToAxis: true, thresholdTime: 500, thresholdDelta: 50 }}
          /* event handlers */
          onSwiper={(swiper) => {
            currentActiveIndex.current = swiper.activeIndex;
            setSwiper(swiper);
          }}
          onTouchEnd={gotoStream} // swiping events
          onKeyPress={gotoStream} // keyboard events
          onScroll={gotoStream} // mousewheel events
          onResize={(swiper) => {
            if (metadataVisible && isMobileView) {
              swiper.disable();
            } else swiper.enable();
            swiper.navigation.init();
          }}
          onSlideChangeTransitionStart={(swiper) => swiper.disable()}
          onSlideChangeTransitionEnd={(swiper) => swiper.enable()}
        >
          {playersData.map((player, i) => (
            <SwiperSlide key={`player-${i + 1}`}>
              {({ isActive, isVisible }) => (
                <Player
                  id={i + 1}
                  {...player}
                  isPlayerActive={isActive}
                  isPlayerVisible={isVisible}
                  toggleMetadata={toggleMetadata}
                  metadataVisible={metadataVisible}
                  gotoStream={(dir) => gotoStream(swiper, dir)}
                  blur={{ enabled: true, stillFrame: isMobileOS() }}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  );
};

export default Feed;
