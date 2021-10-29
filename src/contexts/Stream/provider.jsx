import React, { useCallback, useMemo, useReducer } from 'react';
import StreamContext from './context';

const initialState = {
  pos: 0,
  streams: [],
  activeStream: null
};

const actionTypes = {
  SET_STREAMS: 'SET_STREAMS',
  SET_ACTIVE_STREAM: 'SET_ACTIVE_STREAM'
};

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_STREAMS: {
      const { streams } = action;
      return { streams, activeStream: streams[0], pos: 0 };
    }
    case actionTypes.SET_ACTIVE_STREAM: {
      const { pos, activeStream } = action;
      return { ...state, activeStream, pos };
    }
    default:
      throw new Error('Unexpected action type');
  }
};

const StreamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setStreams = useCallback((streams) => {
    dispatch({ type: actionTypes.SET_STREAMS, streams });
  }, []);

  const setActiveStream = useCallback(
    (pos) => {
      const len = state.streams.length;
      const activeStream = state.streams[((pos % len) + len) % len];
      dispatch({ type: actionTypes.SET_ACTIVE_STREAM, activeStream, pos: activeStream.id });
    },
    [state.streams]
  );

  const nextStream = useCallback(
    () => setActiveStream(state.pos + 1),
    [setActiveStream, state.pos]
  );
  const prevStream = useCallback(
    () => setActiveStream(state.pos - 1),
    [setActiveStream, state.pos]
  );

  const value = useMemo(() => {
    const { activeStream, streams } = state;
    return { activeStream, streams, setStreams, nextStream, prevStream, setActiveStream };
  }, [state, setStreams, nextStream, prevStream, setActiveStream]);

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
