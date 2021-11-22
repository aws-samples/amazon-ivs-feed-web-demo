import { useEffect, useRef, useCallback } from 'react';
import throttle from 'lodash.throttle';
import 'context-filter-polyfill';

import PlayerControls from './PlayerControls';
import Spinner from '../../common/Spinner';
import { Play } from '../../../assets/icons';

import usePlayer from '../../hooks/usePlayer';
import useMobileBreakpoint from '../../../contexts/MobileBreakpoint/useMobileBreakpoint';
import { isCanvasBlank } from '../utils';

import './Player.css';

/**
 * Props:
 * @param {number} id   Player ID
 * @param {string} type 'ACTIVE' | 'NEXT' | 'PREV'
 * @param {string} playbackUrl stream URL to load into the player for playback
 * @param {function toggleMetadata(): void} toggleMetadata toggles metadata panel in mobile view
 */
const Player = ({
  id,
  type,
  playbackUrl,
  isPlayerActive,
  isPlayerVisible,
  toggleMetadata,
  metadataVisible,
  gotoStream,
  blur = { enabled: false, stillFrame: false }
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
    // play,
    // pause,
    log
  } = usePlayer(id);
  const { isMobileView } = useMobileBreakpoint();
  const isActive = useRef(isPlayerActive);
  const isVisible = useRef(isPlayerVisible);
  const canvas = useRef();

  useEffect(() => {
    isActive.current = isPlayerActive;
    isVisible.current = isPlayerVisible;
    // isActive.current ? play() : pause();

    if (!blur.stillFrame && isPlayerActive) {
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
          // canvas.current.width = canvas.current.width; // eslint-disable-line no-self-assign
        });
      }

      load(playbackUrl); // Load new playbackUrl

      if (blur.stillFrame) {
        log('stillFrame blur');
        attachBlur(canvas.current);
      }
      firstLoad.current = false;
    }
  }, [playbackUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const isBlurring = useRef(false);
  const attachBlur = useCallback(
    (canvas) => {
      if (canvas && blur.enabled && !isBlurring.current) {
        const ctx = canvas.getContext('2d');
        ctx.filter = 'blur(3px)';
        isBlurring.current = true;

        const draw = () => {
          if (blur.stillFrame) {
            if (!isCanvasBlank(canvas)) {
              isBlurring.current = false;
              return;
            }
          } else if (!isActive.current && isBlurring.current) {
            isBlurring.current = false;
            return;
          }

          ctx.drawImage(video.current, 0, 0, canvas.width, canvas.height);
          requestAnimationFrame(isVisible.current ? draw : throttledDraw);
        };

        const throttledDraw = throttle(draw, 200, { leading: true });
        requestAnimationFrame(draw);
      }
    },
    [isActive.current, isVisible.current] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleClickOnPlayer = () => {
    if (metadataVisible && isMobileView) {
      toggleMetadata();
    } else togglePlayPause();
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
          className={`btn-play-pause ${isActive.current ? 'active' : ''}`}
          onClick={handleClickOnPlayer}
        >
          {!loading && paused && isActive.current && <Play className="btn-play" />}
        </button>
      </div>
    </div>
  );
};

export default Player;
