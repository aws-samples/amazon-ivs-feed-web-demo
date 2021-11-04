import { useCallback, useRef } from 'react';
import throttle from 'lodash.throttle';

const useThrottledCallback = (callback, delay) => {
  const callbackRef = useRef();
  callbackRef.current = callback;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    throttle((...args) => callbackRef.current(...args), delay),
    []
  );
};

export default useThrottledCallback;
