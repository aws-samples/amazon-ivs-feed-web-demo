import React, { useEffect, useMemo, useState } from 'react';
import MobileBreakpointContext from './context';
import config from '../../config';

const { MOBILE_BREAKPOINT } = config;

const MobileBreakpointProvider = ({ children }) => {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleWindowResize = () => {
      setIsMobileView(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  const value = useMemo(() => ({ isMobileView }), [isMobileView]);

  return (
    <MobileBreakpointContext.Provider value={value}>
      {children}
    </MobileBreakpointContext.Provider>
  );
};

export default MobileBreakpointProvider;
