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

  const setStreams = useCallback((streams) => {
    dispatch({ type: actionTypes.SET_STREAMS, streams });
  }, []);

  const setActiveStream = useCallback(
    (pos) => {
      const len = state.streams.length;
      const activeStream = state.streams[((pos % len) + len) % len];
      dispatch({
        type: actionTypes.SET_ACTIVE_STREAM,
        activeStream,
        pos: activeStream.id
      });
    },
    [state.streams]
  );

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
      gotoNextStream: () => setActiveStream(pos + 1),
      gotoPrevStream: () => setActiveStream(pos - 1)
    };
  }, [state, setStreams, setActiveStream]);

  return <StreamContext.Provider value={value}>{children}</StreamContext.Provider>;
};

export default StreamProvider;
