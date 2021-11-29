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
 * @param {string} state 'ACTIVE' | 'NEXT' | 'PREV'
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
  state,
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
    player
  } = usePlayer(id);
  const { isMobileView } = useMobileBreakpoint();
  const isActive = useRef(isPlayerActive);
  const isVisible = useRef(isPlayerVisible);
  const canvas = useRef();

  useEffect(() => {
    if (playbackUrl) {
      load(playbackUrl);
      if (BLUR.ENABLED && BLUR.STILL_FRAME) clearCanvas();
    }
  }, [playbackUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    isActive.current = isPlayerActive;
    isVisible.current = isPlayerVisible;

    isActive.current || PLAY_IN_BACKGROUND ? play() : pause();

    if (!isVisible.current) toggleMute(true);

    if (BLUR.ENABLED && !BLUR.STILL_FRAME && isActive.current) {
      startBlur(canvas.current); // Start continuous blur for the currently active player(s)
    }

    // Switch player to lowest quality if it's inactive, or auto quality if it's active
    if (!isActive.current) {
      const lowestQuality = player?.getQualities().pop();
      if (lowestQuality) {
        player.setQuality(lowestQuality, true);
      }
    } else player.setAutoQualityMode(true);
  }, [isPlayerActive, isPlayerVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (player && BLUR.ENABLED && BLUR.STILL_FRAME) {
      const startBlurOnPlaying = () => startBlur(canvas.current);
      const playerStateEvent = PLAY_IN_BACKGROUND ? READY : BUFFERING;
      player.addEventListener(playerStateEvent, startBlurOnPlaying); // Start still frame blur when this player starts playing
      return () => player.removeEventListener(playerStateEvent, startBlurOnPlaying);
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

  const handleClickOnPlayer = (e) => {
    if (metadataVisible && isMobileView) {
      toggleMetadata();
    } else togglePlayPause();
  };

  return (
    <div
      className="player-container"
      id={`${state.toLowerCase()}-player-${pid}`}
      inert={!isVisible.current && !isMobileOS() ? '' : null}
    >
      <div
        className={`player-video ${isMobileView && metadataVisible ? 'underlay' : ''}`}
      >
        <video id={`${state.toLowerCase()}-video`} ref={video} playsInline muted />
        <canvas id={`${state.toLowerCase()}-blur`} ref={canvas} />

        <Spinner loading={loading && !paused} />
        <button
          type="button"
          onClick={handleClickOnPlayer}
          aria-label={paused ? 'Play stream' : 'Pause stream'}
          className={`btn-play-pause ${isActive.current ? 'active' : ''}`}
        >
          {!loading && paused && isActive.current && (
            <Play
              className={`btn-play ${isMobileView && metadataVisible ? 'underlay' : ''}`}
            />
          )}
        </button>
      </div>
      <PlayerControls
        muted={muted}
        toggleMute={toggleMute}
        gotoStream={gotoStream}
        toggleMetadata={toggleMetadata}
        metadataVisible={metadataVisible}
        isPlayerVisible={isPlayerVisible}
        hidden={isMobileView && metadataVisible}
      />
    </div>
  );
};

export default Player;
