import React from 'react';
import ReactDOM from 'react-dom';
import './Snackbar.css';

const Snackbar = ({ text }) => {
  return (
    ReactDOM.createPortal(
      <div
        // ref={tooltipRef}
        id="portal"
        className="snackbar"
        style={{
          position: "absolute",
          top: 40,
          left: 30,
        }}
      >
        {text}
      </div>,
      document.body
    )
  )
}

export default Snackbar;