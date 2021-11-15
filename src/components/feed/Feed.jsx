import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react.js';
import { Navigation, Keyboard, Mousewheel } from 'swiper';

import Player from './Player';
import useStream from '../../contexts/Stream/useStream';

import './Feed.css';

const PLAYER_TYPES = Object.freeze({ ACTIVE: 'ACTIVE', NEXT: 'NEXT', PREV: 'PREV' });
const SWIPE_DURATION = 1000; // ms

const Feed = ({ toggleMetadata }) => {
  const { activeStream, actionTriggered, gotoNextStream, gotoPrevStream } = useStream();
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
        _players.unshift(_players.pop());
      } else if (actionTriggered === 'prev') {
        _players.push(_players.shift());
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
    console.log('onStreamChange', { swiper, event });

    if (
      swiper.swipeDirection === 'next' || // Touch: swipe up
      event?.wheelDeltaY < 0 || // MouseWheel: vertical scroll up
      event === 40 || // Keyboard: ArrowDown key pressed (keyCode 40)
      event === 34 // Keyboard: PageDown key pressed (keyCode 34)
    ) {
      gotoNextStream();
    } else if (
      swiper.swipeDirection === 'prev' || // Touch: swipe down
      event?.wheelDeltaY > 0 || // MouseWheel: vertical scroll down
      event === 38 || // Keyboard: ArrowUp key pressed (keyCode 38)
      event === 33 // Keyboard: PageUp key pressed (keyCode 33)
    ) {
      gotoPrevStream();
    }
  };

  const onSlideChangeTransitionStart = (swiper) => {
    swiper.disable();
    setTimeout(() => {
      swiper.enable();
    }, SWIPE_DURATION);
  };

  return (
    <div className="feed-content">
      <Swiper
        /* swiper config */
        loop
        speed={SWIPE_DURATION}
        direction={'vertical'}
        preventInteractionOnTransition
        modules={[Navigation, Keyboard, Mousewheel]}
        /* stream switching */
        mousewheel={true}
        keyboard={{ enabled: true, pageUpDown: true }}
        navigation={{ prevEl: '#prev-stream', nextEl: '#next-stream' }}
        /* event handlers */
        onScroll={onStreamChange}
        onKeyPress={onStreamChange}
        onSlideChange={onStreamChange}
        onSlideChangeTransitionStart={onSlideChangeTransitionStart}
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
  );
};

export default Feed;
