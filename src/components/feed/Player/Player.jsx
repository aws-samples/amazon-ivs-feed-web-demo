import { useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash.throttle';
import 'context-filter-polyfill';

import PlayerControls from './PlayerControls';
import Spinner from '../../common/Spinner';
import { Play } from '../../../assets/icons';

import usePlayer from '../../hooks/usePlayer';
import useMobileBreakpoint from '../../../contexts/MobileBreakpoint/useMobileBreakpoint';
import { isCanvasBlank, isMobileOS } from '../../../utils';
import config from '../../../config';

import './Player.css';

const { BLUR, PLAY_IN_BACKGROUND } = config;
const { READY, BUFFERING } = window.IVSPlayer.PlayerState;

/**
 * Props:
 * @param {number} id   Player ID
 * @param {string} type 'ACTIVE' | 'NEXT' | 'PREV'
 * @param {string} playbackUrl stream URL to load into the player for playback
 * @param {object} swiper Swiper instance
 * @param {boolean} isPlayerActive true if the player is active (1 or 2 players could be active at the same time due to Swiper duplicates)
 * @param {boolean} isPlayerVisible true if the player is currently visible in the viewport (only 1 active player can be visible at any time)
 * @param {boolean} metadataVisible true if the metadata panel is expanded
 * @param {function toggleMetadata(): void} toggleMetadata toggles metadata panel in mobile view
 * @param {function gotoStream(dir: string): void} gotoStream sets the active stream to the one corresponding to dir ('next' or 'prev')
 */
const Player = ({
  id,
  type,
  playbackUrl,
  swiper,
  isPlayerActive,
  isPlayerVisible,
  metadataVisible,
  toggleMetadata,
  gotoStream
}) => {
  const {
    pid,
    video,
    load,
    muted,
    paused,
    loading,
    toggleMute,
    togglePlayPause,
    play,
    pause,
    player,
    log
  } = usePlayer(id);
  const { isMobileView } = useMobileBreakpoint();
  const isActive = useRef(isPlayerActive);
  const isVisible = useRef(isPlayerVisible);
  const canvas = useRef();

  useEffect(() => {
    isActive.current = isPlayerActive;
    isVisible.current = isPlayerVisible;

    isActive.current || PLAY_IN_BACKGROUND ? play() : pause();

    if (!isVisible.current) toggleMute(true);

    if (BLUR.ENABLED && !BLUR.STILL_FRAME && isActive.current) {
      startBlur(canvas.current); // start continuous blur for the currently active player(s)
    }
  }, [isPlayerActive, isPlayerVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (playbackUrl) {
      load(playbackUrl);
      if (BLUR.ENABLED && BLUR.STILL_FRAME) clearCanvas();
    }
  }, [playbackUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (player && BLUR.ENABLED && BLUR.STILL_FRAME) {
      const startBlurOnPlaying = () => startBlur(canvas.current);
      const playerState = PLAY_IN_BACKGROUND ? READY : BUFFERING;
      player.addEventListener(playerState, startBlurOnPlaying); // start still frame blur when this player starts playing
      return () => player.removeEventListener(playerState, startBlurOnPlaying);
    }
  }, [player]); // eslint-disable-line react-hooks/exhaustive-deps

  const clearCanvas = () => {
    const context = canvas.current.getContext('2d');
    context.clearRect(0, 0, canvas.current.width, canvas.current.height);
    if (isMobileOS()) canvas.current.width = canvas.current.width; // eslint-disable-line no-self-assign
  };

  const isBlurring = useRef(false);
  const startBlur = useCallback(
    (canvas) => {
      if (canvas && BLUR.ENABLED && !isBlurring.current) {
        clearCanvas();
        isBlurring.current = true;
        const context = canvas.getContext('2d');
        context.filter = 'blur(3px)';

        const draw = () => {
          if (isBlurring.current) {
            if (
              (BLUR.STILL_FRAME && !isCanvasBlank(canvas)) ||
              (!BLUR.STILL_FRAME && !isActive.current)
            ) {
              isBlurring.current = false;
              return;
            }
          }

          context.drawImage(video.current, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(drawFn);
        };
        const throttledDraw = throttle(draw, 200, { leading: true });

        const drawFn = BLUR.STILL_FRAME || !isVisible.current ? throttledDraw : draw;
        requestAnimationFrame(drawFn);
      }
    },
    [isActive.current, isVisible.current] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleClickOnPlayer = () => {
    console.log('handleClickOnPlayer');
    if (metadataVisible && isMobileView) {
      console.log('handleClickOnPlayer - toggleMetadata');
      toggleMetadata();
    } else {
      console.log('handleClickOnPlayer - togglePlayPause');
      togglePlayPause();
    }
  };

  return (
    <div id={`${type.toLowerCase()}-player-${pid}`} className="player-container">
      <PlayerControls
        muted={muted}
        toggleMute={toggleMute}
        gotoStream={gotoStream}
        toggleMetadata={toggleMetadata}
        metadataVisible={metadataVisible}
      />
      <div
        className={`player-video ${metadataVisible && isMobileView ? 'underlay' : ''}`}
      >
        <video id={`${type.toLowerCase()}-video`} ref={video} playsInline muted />
        <canvas id={`${type.toLowerCase()}-blur`} ref={canvas} />

        <Spinner loading={loading && !paused} />
        <button
          type="button"
          className={`btn-play-pause ${isActive.current ? 'active' : ''}`}
          onClick={handleClickOnPlayer}
        >
          {!loading && paused && isActive.current && (
            <Play
              className={`btn-play ${metadataVisible && isMobileView ? 'underlay' : ''}`}
            />
          )}
        </button>
      </div>
    </div>
  );
};

export default Player;
