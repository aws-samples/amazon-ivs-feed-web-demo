import React from 'react';
import * as Icons from '../../../assets/icons';

import './Button.css';

const Button = React.forwardRef(
  ({ children, onClick, label = '', ...otherProps }, ref) => {
    const Icon = Icons[children] || children;

    const clickHandler = (e) => {
      if (onClick) {
        e.stopPropagation();
        onClick(e);
      }
    };

    return (
      <span style={{ cursor: 'pointer' }}>
        <button
          ref={ref}
          type="button"
          className="button"
          onClick={clickHandler}
          aria-label={label || children}
          {...otherProps}
        >
          {typeof Icon === 'string' ? `${Icon} ` : <Icon />}
        </button>
      </span>
    );
  }
);

export default Button;
