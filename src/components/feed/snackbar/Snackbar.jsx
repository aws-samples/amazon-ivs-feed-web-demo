import React from 'react';
import ReactDOM from 'react-dom';
import { Check } from '../../../assets/icons';
import './Snackbar.css';

const Snackbar = ({ text, showSnackbar }) => {
  return (
    ReactDOM.createPortal(
      <div
        // ref={tooltipRef}
        id="portal"
        className={`snackbar${showSnackbar ? " visible" : ""}`}
      >
        <Check />
        {text}
      </div>,
      document.body
    )
  )
}

export default Snackbar;