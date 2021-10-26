import { useContext } from 'react';
import StreamContext from './context';

const useStream = () => {
  const context = useContext(StreamContext);

  if (!context) {
    throw new Error('Player context must be consumed inside the Player Provider');
  }

  return context;
};

export default useStream;
