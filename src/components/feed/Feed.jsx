import React, { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import { Navigation, Keyboard, Mousewheel } from 'swiper';

import Player from './Player';
import useStream from '../../contexts/Stream/useStream';
import config from '../../config';

import './Feed.css';

const PLAYER_TYPES = Object.freeze({ ACTIVE: 'ACTIVE', NEXT: 'NEXT', PREV: 'PREV' });
const { SWIPE_DURATION } = config;

const Feed = ({ toggleMetadata }) => {
  const { activeStream, throttledGotoNextStream, throttledGotoPrevStream } = useStream();
  const [players, setPlayers] = useState([
    { playbackUrl: '', type: PLAYER_TYPES.ACTIVE },
    { playbackUrl: '', type: PLAYER_TYPES.NEXT },
    { playbackUrl: '', type: PLAYER_TYPES.PREV }
  ]);
  const swipeDirection = useRef(null);

  useEffect(() => {
    if (activeStream) {
      const [activePlaybackUrl, nextPlaybackUrl, prevPlaybackUrl] = [
        activeStream,
        activeStream.next,
        activeStream.prev
      ].map(({ data }) => data.stream.playbackUrl);

      let newPlayers = [...players];

      if (swipeDirection.current === 'next') {
        newPlayers.unshift(newPlayers.pop()); // shift players down
      } else if (swipeDirection.current === 'prev') {
        newPlayers.push(newPlayers.shift()); // shift players up
      }

      newPlayers = newPlayers.map((player) => {
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

      setPlayers(newPlayers);
      swipeDirection.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream]);

  const setSwipeDirection = (swiper, event) => {
    if (!swipeDirection.current) {
      if (
        (swiper && swiper.swipeDirection === 'next') || // Touch: swipe up
        event?.wheelDeltaY < 0 || // MouseWheel: vertical scroll up
        event === 40 || // Keyboard: ArrowDown (keyCode 40)
        event === 34 || // Keyboard: PageDown (keyCode 34)
        event === 'next' // Other: direct swipe direction set (i.e. next nav. button)
      ) {
        swipeDirection.current = 'next';
      } else if (
        (swiper && swiper.swipeDirection === 'prev') || // Touch: swipe down
        event?.wheelDeltaY > 0 || // MouseWheel: vertical scroll down
        event === 38 || // Keyboard: ArrowUp (keyCode 38)
        event === 33 || // Keyboard: PageUp (keyCode 33)
        event === 'prev' // Other: direct swipe direction set (i.e. prev nav. button)
      ) {
        swipeDirection.current = 'prev';
      }
    } else swipeDirection.current = null;
  };

  const updateStreams = () => {
    if (swipeDirection.current === 'next') throttledGotoNextStream();
    if (swipeDirection.current === 'prev') throttledGotoPrevStream();
  };

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    !!activeStream &&
    players.every(({ playbackUrl }) => !!playbackUrl) && (
      <div className="feed-content">
        <Swiper
          /* swiper config */
          loop
          nested
          autoHeight
          watchSlidesProgress
          updateOnWindowResize
          simulateTouch={false}
          direction={'vertical'}
          speed={SWIPE_DURATION}
          preventInteractionOnTransition
          /* slide switching modules config */
          modules={[Keyboard, Navigation, Mousewheel]}
          keyboard
          navigation={{ prevEl: '#prev-stream', nextEl: '#next-stream' }}
          mousewheel={{ forceToAxis: true, thresholdTime: 750, thresholdDelta: 75 }}
          /* event handlers */
          onScroll={setSwipeDirection} // mousewheel events
          onKeyPress={setSwipeDirection} // keyboard events
          onSlideChange={setSwipeDirection} // swipe events
          onSlideChangeTransitionStart={(swiper) => swiper.disable()}
          onSlideChangeTransitionEnd={(swiper) => {
            swiper.enable();
            updateStreams();
            setTimeout(() => {
              swiper.update();
              swiper.slideReset();
              swiper.slideToClosest();
            });
          }}
          onTouchEnd={updateStreams} // mobile touch swipes
        >
          {players.map((player, i) => (
            <SwiperSlide key={`player-${i + 1}`}>
              {({ isVisible }) => (
                <Player
                  {...player}
                  id={i + 1}
                  blur={{ enabled: true, stillFrame: true }}
                  isPlayerVisible={isVisible}
                  isPlayerActive={player.type === PLAYER_TYPES.ACTIVE}
                  toggleMetadata={toggleMetadata}
                  setSwipeDirection={(dir) => setSwipeDirection(null, dir)}
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
