import React, { useEffect, useState } from 'react';
import { hexToRgb } from '../utils';
import './Placeholder.css';

const Placeholder = (props) => {
  const { avatar, bgColor, isActive, playing, spinnerColor, userName } = props;

  const [gradientBg, setGradientBg] = useState('');

  const getRgba = (rgb, alpha) => {
    const [r, g, b] = rgb;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  useEffect(() => {
    const rgb = hexToRgb(bgColor);

    setGradientBg(
      `linear-gradient(0deg, ${getRgba(rgb, 1)} 50%, ${getRgba(
        rgb,
        0.9,
      )} 100%), linear-gradient(90deg, ${getRgba(rgb, 0.9)} 0%, ${getRgba(
        rgb,
        0.6,
      )} 100%), linear-gradient(180deg, ${getRgba(rgb, 0.6)} 0%, ${getRgba(
        rgb,
        0.3,
      )} 100%), linear-gradient(360deg, ${getRgba(rgb, 0.3)} 0%, ${getRgba(
        rgb,
        0,
      )} 100%)`,
    );
  }, [bgColor]);

  if (isActive && playing) {
    return null;
  }

  return (
    <div className="placeholder" style={{ background: bgColor }}>
      <div className="placeholder-content">
        {isActive && !playing && (
          <div
            className="placeholder-spinner"
            style={{ background: spinnerColor }}
          >
            <div
              className="placeholder-gradient"
              style={{ backgroundImage: gradientBg }}
            />
          </div>
        )}

        <img
          className="placeholder-avatar"
          src={avatar}
          alt={`${userName} avatar`}
        />
      </div>
    </div>
  );
};

export default Placeholder;
