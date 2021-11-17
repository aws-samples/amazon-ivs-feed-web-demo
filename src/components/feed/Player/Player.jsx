import { useEffect } from 'react';
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
const Player = ({ id, type, playbackUrl, isPlayerActive, toggleMetadata }) => {
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
    // log
  } = usePlayer(id);
  const isActive = isPlayerActive(video.current);

  useEffect(() => {
    if (playbackUrl) load(playbackUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playbackUrl]);

  useEffect(() => {
    isActive ? play() : pause();
  }, [isActive, pause, play, video]);

  // const isBlurring = useRef(false);
  // const attachBlur = useCallback(
  //   (canvas) => {
  //     if (canvas && isPlayerInViewport(video.current) && !isBlurring.current) {
  //       isBlurring.current = true;
  //       const ctx = canvas.getContext('2d');
  //       ctx.filter = 'blur(3px)';

  //       requestAnimationFrame(function draw() {
  //         if (!isPlayerInViewport(video.current)) {
  //           isBlurring.current = false;
  //           return;
  //         }
  //         ctx.drawImage(video.current, 0, 0, canvas.width, canvas.height);
  //         requestAnimationFrame(draw);
  //       });
  //     }
  //   },
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [type, player, isPlayerInViewport(video.current)]
  // );

  if (!window.IVSPlayer.isPlayerSupported) {
    console.warn('The current browser does not support the Amazon IVS player.');
    return null;
  }

  return (
    <div id={`${type.toLowerCase()}-player-${pid}`} className="player-container">
      <PlayerControls
        muted={muted}
        toggleMute={toggleMute}
        toggleMetadata={toggleMetadata}
      />
      <div className="player-video">
        <video id={`${type.toLowerCase()}-video`} ref={video} playsInline muted />
        {/* <canvas id={`${type.toLowerCase()}-blur`} ref={attachBlur} /> */}

        <Spinner loading={loading && !paused && isActive} />
        <div
          className={`btn-play-pause ${isActive ? 'active' : ''}`}
          onClick={() => togglePlayPause()}
          tabIndex={1}
        >
          {!loading && paused && isActive && <Play className="btn-play" />}
        </div>
      </div>
    </div>
  );
};

export default Player;
