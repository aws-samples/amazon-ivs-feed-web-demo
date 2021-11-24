import { useContext } from 'react';
import StreamContext from './context';

const useStream = () => {
  const context = useContext(StreamContext);

  if (!context) {
    throw new Error('Stream context must be consumed inside the Stream Provider');
  }

  return context;
};

export default useStream;
