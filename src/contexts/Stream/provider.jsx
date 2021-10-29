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
      const { stream } = action;
      const pos = state.streams.findIndex((s) => s.id === stream.id);
      return { ...state, activeStream: stream, pos };
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

  const setActiveStream = useCallback((stream) => {
    dispatch({ type: actionTypes.SET_ACTIVE_STREAM, stream });
  }, []);

  const value = useMemo(() => {
    let { activeStream, pos } = state;

    const getStream = (stPos) => {
      const len = state.streams.length;
      return state.streams[((stPos % len) + len) % len];
    };

    const nextStream = getStream(pos + 1);
    const prevStream = getStream(pos - 1);

    return {
      activeStream,
      nextStream,
      prevStream,
      setStreams,
      gotoNextStream: () => setActiveStream(nextStream),
      gotoPrevStream: () => setActiveStream(prevStream)
    };
  }, [state, setStreams, setActiveStream]);

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
