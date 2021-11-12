import React from 'react';

const Spinner = () => (
  <svg viewBox="0 0 100 100">
    <clipPath id="clip">
      <path d="M 50 0 a 50 50 0 0 1 0 100 50 50 0 0 1 0 -100 v 8 a 42 42 0 0 0 0 84 42 42 0 0 0 0 -84" />
    </clipPath>

    <foreignObject x="0" y="0" width="100" height="100" clipPath="url(#clip)">
      <div
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background:
            'conic-gradient(from 180deg at 50% 50%, #FFFFFF 0deg, rgba(255, 255, 255, 0) 360deg)'
        }}
        xmlns="http://www.w3.org/1999/xhtml"
      />
    </foreignObject>
  </svg>
);

export default Spinner;
