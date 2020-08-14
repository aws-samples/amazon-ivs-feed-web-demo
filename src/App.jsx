import React, { useEffect, useState } from 'react';
import Feed from './components/feed';

const feedJSON = `${process.env.PUBLIC_URL}/feed.json`;

const App = () => {
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    async function fetchStreams() {
      const response = await fetch(feedJSON);
      const data = await response.json();

      setStreams(data.streams);
    }

    fetchStreams();
  }, []);

  return (
    <div className="App">
      <Feed streams={streams} />
    </div>
  );
};

export default App;
