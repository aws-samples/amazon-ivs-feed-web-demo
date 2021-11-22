import React, { useCallback, useMemo, useReducer } from 'react';

import StreamContext from './context';
import CircularLinkedList from './CircularLinkedList';
import useThrottledCallback from '../../components/hooks/useThrottledCallback';

import config from '../../config';

const { SWIPE_DURATION } = config;

const initialState = {
  streams: null, // Circular doubly linked list of stream nodes
  activeStream: null // Reference to currently active stream node
};

const actionTypes = {
  SET_STREAMS: 'SET_STREAMS',
  SET_ACTIVE_STREAM: 'SET_ACTIVE_STREAM'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STREAMS: {
      const { streams, activeStream } = action;
      return { streams, activeStream };
    }
    case actionTypes.SET_ACTIVE_STREAM: {
      const { activeStream } = action;
      return { ...state, activeStream };
    }
    default:
      throw new Error('Unexpected action type');
  }
};

const StreamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const compareStreams = (s0, s1) => s0.id === s1.id;

  const setStreams = useCallback((streamsData, initialStreamId) => {
    const streams = new CircularLinkedList(streamsData, compareStreams);
    const activeStream = streams.get({ id: initialStreamId }) || streams.head;
    dispatch({ type: actionTypes.SET_STREAMS, streams, activeStream });
  }, []);

  const setActiveStream = useCallback((streamNode) => {
    if (streamNode) {
      dispatch({ type: actionTypes.SET_ACTIVE_STREAM, activeStream: streamNode });
    }
  }, []);

  const throttledGotoNextStream = useThrottledCallback(() => {
    console.log('throttledGotoNextStream');
    state.activeStream && setActiveStream(state.activeStream.next);
  }, SWIPE_DURATION);

  const throttledGotoPrevStream = useThrottledCallback(() => {
    console.log('throttledGotoPrevStream');
    state.activeStream && setActiveStream(state.activeStream.prev);
  }, SWIPE_DURATION);

  const value = useMemo(
    () => ({
      ...state,
      setStreams,
      setActiveStream,
      throttledGotoNextStream,
      throttledGotoPrevStream
    }),
    [state, setStreams, setActiveStream, throttledGotoNextStream, throttledGotoPrevStream]
  );

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
