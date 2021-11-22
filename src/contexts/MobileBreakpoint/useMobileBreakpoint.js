import { useContext } from 'react';
import MobileBreakpointContext from './context';

const useMobileBreakpoint = () => {
  const context = useContext(MobileBreakpointContext);

  if (!context) {
    throw new Error(
      'MobileBreakpoint context must be consumed inside the MobileBreakpoint Provider'
    );
  }

  return context;
};

export default useMobileBreakpoint;
