import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import { Navigation, Keyboard, Mousewheel } from 'swiper';

import Player from './Player';
import useStream from '../../contexts/Stream/useStream';

import './Feed.css';

const PLAYER_TYPES = Object.freeze({ ACTIVE: 'ACTIVE', NEXT: 'NEXT', PREV: 'PREV' });
const SWIPE_DURATION = 400; // ms

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
  const [swiper, setSwiper] = useState(null);

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
    if (swiper.swipeDirection || event) {
      if (
        swiper.swipeDirection === 'next' || // Touch: swipe up
        event?.wheelDeltaY < 0 || // MouseWheel: vertical scroll up
        event === 40 || // Keyboard: ArrowDown (keyCode 40)
        event === 34 // Keyboard: PageDown (keyCode 34)
      ) {
        throttledGotoNextStream();
      } else if (
        swiper.swipeDirection === 'prev' || // Touch: swipe down
        event?.wheelDeltaY > 0 || // MouseWheel: vertical scroll down
        event === 38 || // Keyboard: ArrowUp (keyCode 38)
        event === 33 // Keyboard: PageUp (keyCode 33)
      ) {
        throttledGotoPrevStream();
      }
    }
  };

  const swiperHeartbeat = (swiper) => {
    const currentSlidePlayerElem = swiper.slides[swiper.activeIndex].firstElementChild;
    const isCurrentSlideActive = currentSlidePlayerElem.id.includes('active');
    if (!isCurrentSlideActive) {
      swiper.enable();
      if (actionTriggered === 'next') {
        swiper.slideNext(SWIPE_DURATION, false);
      } else if (actionTriggered === 'prev') {
        swiper.slidePrev(SWIPE_DURATION, false);
      }
    }
  };

  const isPlayerInViewport = (playerVideo) => {
    if (swiper && playerVideo) {
      const activeSlide = swiper.slides[swiper.activeIndex];
      const activeVideo = activeSlide.querySelector('video');
      return activeVideo === playerVideo;
    } else return false;
  };

  return (
    !!activeStream &&
    players.every(({ playbackUrl }) => !!playbackUrl) && (
      <div className="feed-content">
        <Swiper
          /* swiper config */
          loop
          autoHeight
          simulateTouch={false}
          direction={'vertical'}
          speed={SWIPE_DURATION}
          preventInteractionOnTransition
          modules={[Navigation, Keyboard, Mousewheel]}
          /* stream switching */
          mousewheel={true}
          keyboard={{ enabled: true }}
          navigation={{ prevEl: '#prev-stream', nextEl: '#next-stream' }}
          /* event handlers */
          onSwiper={(swiper) => setSwiper(swiper)}
          onScroll={onStreamChange}
          onKeyPress={onStreamChange}
          onSlideChange={onStreamChange}
          onBeforeResize={(swiper) => swiper.update(swiper)}
          onBeforeTransitionStart={(swiper) => swiper.keyboard.disable()}
          onSlideChangeTransitionEnd={(swiper) => {
            swiper.keyboard.enable();
            swiper.update();
            swiperHeartbeat(swiper);
          }}
        >
          {players.map((player, i) => (
            <SwiperSlide key={`player-${i + 1}`}>
              <Player
                {...player}
                id={i + 1}
                toggleMetadata={toggleMetadata}
                isPlayerActive={(playerVideo) =>
                  player.type === PLAYER_TYPES.ACTIVE && isPlayerInViewport(playerVideo)
                }
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    )
  );
};

export default Feed;
