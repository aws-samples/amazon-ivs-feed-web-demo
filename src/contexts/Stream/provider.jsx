import React, { useCallback, useMemo, useReducer } from 'react';
import StreamContext from './context';
import CircularLinkedList from '../../utils/CircularLinkedList';
import useThrottledCallback from '../../components/hooks/useThrottledCallback';

const initialState = {
  streams: null, // Circular doubly linked list of stream nodes
  activeStream: null, // Reference to currently active stream node
  actionTriggered: null // The type of action triggered to change the streams ('next', 'prev' or 'null' for anything else)
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
      const { activeStream, actionTriggered } = action;
      return { ...state, activeStream, actionTriggered };
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

  const setActiveStream = useCallback((streamNode, actionTriggered = null) => {
    if (streamNode) {
      dispatch({
        type: actionTypes.SET_ACTIVE_STREAM,
        activeStream: streamNode,
        actionTriggered: actionTriggered
      });
    }
  }, []);

  const throttledGotoNextStream = useThrottledCallback(() => {
    state.activeStream && setActiveStream(state.activeStream.next, 'next');
  }, 400);

  const throttledGotoPrevStream = useThrottledCallback(() => {
    state.activeStream && setActiveStream(state.activeStream.prev, 'prev');
  }, 400);

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
