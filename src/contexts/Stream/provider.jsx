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
      const { activeStream } = action;
      const pos = state.streams.findIndex((s) => s.id === activeStream.id);
      return { ...state, activeStream, pos };
    }
    default:
      throw new Error('Unexpected action type');
  }
};

const StreamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getStream = useCallback(
    (pos) => {
      const len = state.streams.length;
      return state.streams[((pos % len) + len) % len];
    },
    [state.streams]
  );

  const setStreams = useCallback((streams) => {
    dispatch({ type: actionTypes.SET_STREAMS, streams });
  }, []);

  const setActiveStream = useCallback(
    (pos) => {
      const activeStream = getStream(pos);
      dispatch({
        type: actionTypes.SET_ACTIVE_STREAM,
        activeStream,
        pos: activeStream.id
      });
    },
    [getStream]
  );

  const gotoNextStream = useCallback(
    () => setActiveStream(state.pos + 1),
    [setActiveStream, state.pos]
  );

  const gotoPrevStream = useCallback(
    () => setActiveStream(state.pos - 1),
    [setActiveStream, state.pos]
  );

  const value = useMemo(
    () => ({
      setStreams,
      setActiveStream,
      gotoNextStream,
      gotoPrevStream,
      streams: state.streams,
      activeStream: state.activeStream,
      nextStream: getStream(state.pos + 1),
      prevStream: getStream(state.pos - 1)
    }),
    [state, setStreams, setActiveStream, gotoNextStream, gotoPrevStream, getStream]
  );

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
