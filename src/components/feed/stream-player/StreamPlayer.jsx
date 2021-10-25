import React, { useEffect, useRef, useState } from 'react';

import Like from '../like';
import Placeholder from '../placeholder';
import StreamMetadata from '../stream-metadata';

import { isElementInViewport } from '../utils';
import { VolumeOff, VolumeUp } from '../../../assets/icons';
import './StreamPlayer.css';

const StreamPlayer = (props) => {
  const { active, loading, player, streamData, setStream } = props;
  const { id, stream, metadata } = streamData;

  const [muted, setMuted] = useState(false);

  const videoEl = useRef(null);
  const visibleRef = useRef(false);

  // handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (!active || loading) return;

    setMuted(player.isMuted());
  }, [active, loading, player]);

  useEffect(() => {
    if (!active) return;

    player.pause();

    player.attachHTMLVideoElement(videoEl.current);
    player.load(stream.playbackUrl);

    player.play();
  }, [player, active, stream.playbackUrl]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = isElementInViewport(videoEl.current);

      if (visible === visibleRef.current) return;

      visibleRef.current = visible;
      setStream(id, visible);
    };

    onVisibilityChange();

    window.addEventListener('scroll', onVisibilityChange);
    window.addEventListener('resize', onVisibilityChange);

    return () => {
      window.removeEventListener('scroll', onVisibilityChange);
      window.removeEventListener('resize', onVisibilityChange);
    };
  }, [id, setStream]);

  const toggleMute = () => {
    const muteNext = !player.isMuted();

    player.setMuted(muteNext);
    setMuted(muteNext);
  };

  const { streamTitle, userAvatar, userColors, userName } = metadata;
  const { state, startTime } = stream;
  const { primary, secondary } = userColors;

  return (
    <div className={`stream-wrapper${active ? ' stream-wrapper--active' : ''}`}>
      <div className="aspect-16x9" style={{ background: primary }}>
        <div className="player-ui">
          <video className="player-video-el" ref={videoEl} playsInline muted />

          {!loading && (
            <div className="player-ui-actions">
              <button className="player-ui-button" onClick={toggleMute}>
                {muted ? <VolumeOff /> : <VolumeUp />}
              </button>

              <Like />
            </div>
          )}
        </div>

        <Placeholder
          avatar={userAvatar}
          bgColor={primary}
          isActive={active}
          playing={active && !loading}
          spinnerColor={secondary}
          userName={userName}
        />
      </div>

      {/* <StreamMetadata
        active={active}
        startTime={startTime}
        state={state}
        title={streamTitle}
        userAvatar={userAvatar}
        userName={userName}
      /> */}
    </div>
  );
};

export default StreamPlayer;
