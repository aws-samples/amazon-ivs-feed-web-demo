import React, { useCallback, useMemo, useReducer } from 'react';
import StreamContext from './context';
import CircularLinkedList from '../../utils/CircularLinkedList';

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
      const { streams } = action;
      return { streams, activeStream: streams.head };
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

  const setStreams = useCallback((streams) => {
    dispatch({
      type: actionTypes.SET_STREAMS,
      streams: new CircularLinkedList(streams, compareStreams)
    });
  }, []);

  const setActiveStream = useCallback((streamNode) => {
    dispatch({
      type: actionTypes.SET_ACTIVE_STREAM,
      activeStream: streamNode
    });
  }, []);

  const setActiveStreamById = useCallback(
    (streamId) => {
      dispatch({
        type: actionTypes.SET_ACTIVE_STREAM,
        activeStream: state.streams.get({ id: streamId })
      });
    },
    [state.streams]
  );

  const value = useMemo(
    () => ({
      ...state,
      setStreams,
      setActiveStream,
      setActiveStreamById
    }),
    [state, setStreams, setActiveStream, setActiveStreamById]
  );

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
