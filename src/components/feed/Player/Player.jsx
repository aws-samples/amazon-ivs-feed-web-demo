import { useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash.throttle';
import 'context-filter-polyfill';

import PlayerControls from './PlayerControls';
import Spinner from '../../common/Spinner';
import { Play } from '../../../assets/icons';

import usePlayer from '../../hooks/usePlayer';

import './Player.css';

/**
 * Props:
 * @param {number} id   Player ID
 * @param {string} type 'ACTIVE' | 'NEXT' | 'PREV'
 * @param {string} playbackUrl stream URL to load into the player for playback
 * @param {function isPlayerActive(HTMLVideoElement): boolean} isPlayerActive true if type is 'ACTIVE' and player's attached HTML video element is in viewport; false otherwise
 * @param {function toggleMetadata(): void} toggleMetadata toggles metadata panel in mobile view
 */
const Player = ({
  id,
  blur,
  type,
  playbackUrl,
  isPlayerActive,
  isPlayerVisible,
  toggleMetadata,
  setSwipeDirection
}) => {
  const {
    pid,
    video,
    load,
    muted,
    paused,
    loading,
    toggleMute,
    play,
    pause,
    togglePlayPause
  } = usePlayer(id);
  const isActive = useRef(isPlayerActive);
  const isVisible = useRef(isPlayerVisible);
  const canvas = useRef();

  useEffect(() => {
    isActive.current = isPlayerActive;
    isVisible.current = isPlayerVisible;
    isActive.current ? play() : pause();
    if (blur.enabled && isActive.current && !isBlurring.current) {
      attachBlur(canvas.current);
    }
  }, [isPlayerActive, isPlayerVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  const firstLoad = useRef(true);
  useEffect(() => {
    if (playbackUrl) {
      if (!firstLoad.current && blur.enabled) {
        // Clear the canvas since we're loading a new stream
        setTimeout(() => {
          canvas.current
            .getContext('2d')
            .clearRect(0, 0, canvas.current.width, canvas.current.height);
          // Required for iOS to reset canvas
          canvas.current.width = canvas.current.width; // eslint-disable-line no-self-assign
        });
      }

      load(playbackUrl); // Load new playbackUrl
      firstLoad.current = false;
    }
  }, [blur.enabled, load, playbackUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCanvasBlank = () => {
    const can = canvas.current;
    const ctx = can.getContext('2d');
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, can.width, can.height).data.buffer
    );
    return !pixelBuffer.some((color) => color !== 0);
  };

  const isBlurring = useRef(false);
  const attachBlur = useCallback(
    (canvas) => {
      if (canvas && !isBlurring.current) {
        const ctx = canvas.getContext('2d');
        ctx.filter = 'blur(3px)';
        isBlurring.current = true;

        const draw = () => {
          if (
            (!isActive.current && isBlurring.current) ||
            (blur.stillFrame && !isCanvasBlank())
          ) {
            isBlurring.current = false;
            return;
          }

          ctx.drawImage(video.current, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(isVisible.current ? draw : throttledDraw);
        };

        const throttledDraw = throttle(draw, 200, { leading: true });
        requestAnimationFrame(isVisible.current ? draw : throttledDraw);
      }
    },
    [isActive.current, isVisible.current] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div id={`${type.toLowerCase()}-player-${pid}`} className="player-container">
      <PlayerControls
        muted={muted}
        toggleMute={toggleMute}
        toggleMetadata={toggleMetadata}
        setSwipeDirection={setSwipeDirection}
      />
      <div className="player-video">
        <video id={`${type.toLowerCase()}-video`} ref={video} playsInline muted />
        <canvas id={`${type.toLowerCase()}-blur`} ref={canvas} />

        <Spinner loading={loading && !paused} />
        <div
          className={`btn-play-pause ${isActive.current ? 'active' : ''}`}
          onClick={() => togglePlayPause()}
        >
          {!loading && paused && isActive.current && <Play className="btn-play" />}
        </div>
      </div>
    </div>
  );
};

export default Player;
