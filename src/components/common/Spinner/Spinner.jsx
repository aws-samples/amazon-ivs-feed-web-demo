import React from 'react';
import SpinnerSVG from '../../../assets/icons/spinner';

import './Spinner.css';

const Spinner = ({ loading }) =>
  loading && (
    <div className="spinner">
      <SpinnerSVG />
    </div>
  );

export default Spinner;
