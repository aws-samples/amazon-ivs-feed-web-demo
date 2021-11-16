import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react.js';
import { Navigation, Keyboard, Mousewheel } from 'swiper';

import Player from './Player';
import useStream from '../../contexts/Stream/useStream';

import './Feed.css';

const PLAYER_TYPES = Object.freeze({ ACTIVE: 'ACTIVE', NEXT: 'NEXT', PREV: 'PREV' });
const SWIPE_DURATION = 750; // ms

const Feed = ({ toggleMetadata }) => {
  const {
    activeStream,
    actionTriggered,
    throttledGotoNextStream,
    throttledGotoPrevStream
  } = useStream();
  const [players, setPlayers] = useState([
    { playbackUrl: '', type: PLAYER_TYPES.ACTIVE },
    { playbackUrl: '', type: PLAYER_TYPES.NEXT },
    { playbackUrl: '', type: PLAYER_TYPES.PREV }
  ]);

  useEffect(() => {
    if (activeStream) {
      const streams = [activeStream, activeStream.next, activeStream.prev];
      const [activePlaybackUrl, nextPlaybackUrl, prevPlaybackUrl] = streams.map(
        ({ data }) => data.stream.playbackUrl
      );

      let _players = [...players];

      if (actionTriggered === 'next') {
        _players.unshift(_players.pop()); // shift players down
      } else if (actionTriggered === 'prev') {
        _players.push(_players.shift()); // shift players up
      }

      _players = _players.map((player) => {
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

      setPlayers(_players);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStream]);

  const onStreamChange = (swiper, event) => {
    const throttleSwiper = () => {
      if (swiper.enabled) {
        swiper.disable();
        setTimeout(() => swiper.enable(), SWIPE_DURATION);
      }
    };

    if (
      swiper.swipeDirection === 'next' || // Touch: swipe up
      event?.wheelDeltaY < 0 || // MouseWheel: vertical scroll up
      event === 40 // Keyboard: ArrowDown key pressed (keyCode 40)
    ) {
      throttledGotoNextStream();
      throttleSwiper();
    } else if (
      swiper.swipeDirection === 'prev' || // Touch: swipe down
      event?.wheelDeltaY > 0 || // MouseWheel: vertical scroll down
      event === 38 // Keyboard: ArrowUp key pressed (keyCode 38)
    ) {
      throttledGotoPrevStream();
      throttleSwiper();
    }
  };

  return (
    !!activeStream &&
    players.every(({ playbackUrl }) => !!playbackUrl) && (
      <div className="feed-content">
        <Swiper
          /* swiper config */
          loop
          autoHeight
          direction={'vertical'}
          speed={SWIPE_DURATION}
          preventInteractionOnTransition
          modules={[Navigation, Keyboard, Mousewheel]}
          /* stream switching */
          mousewheel={true}
          keyboard={{ enabled: true, pageUpDown: false }}
          navigation={{ prevEl: '#prev-stream', nextEl: '#next-stream' }}
          /* event handlers */
          onScroll={onStreamChange}
          onKeyPress={onStreamChange}
          onSlideChange={onStreamChange}
          onBeforeResize={(swiper) => swiper.update()}
          onSlideChangeTransitionEnd={(swiper) => {
            // Heartbeat function to ensure that the visible slide is on the active player
            swiper.update();
            const currentSlidePlayerElem =
              swiper.slides[swiper.activeIndex].firstElementChild;
            const isCurrentSlideActive = currentSlidePlayerElem.id.includes('active');

            if (!isCurrentSlideActive) {
              // slide to active stream
              const realIndex = players.findIndex(
                ({ type }) => type === PLAYER_TYPES.ACTIVE
              );
              swiper.enable();
              swiper.slideToLoop(realIndex, SWIPE_DURATION, false);
            }
          }}
        >
          {players.map((player, i) => (
            <SwiperSlide key={`player-${i + 1}`}>
              <Player
                {...player}
                id={i + 1}
                toggleMetadata={toggleMetadata}
                isActive={player.type === PLAYER_TYPES.ACTIVE}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  );
};

export default Feed;
