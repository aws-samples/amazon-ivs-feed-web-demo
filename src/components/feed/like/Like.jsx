import React, { useState } from 'react';
import Heart from './Heart';

import { getRandomColor } from '../utils';
import { Favorite } from '../../../assets/icons';
import './Like.css';

const Like = (props) => {
  const { heartCount = 1 } = props;

  const [hearts, setHearts] = useState([]);

  const animateLike = () => {
    for (let i = 0; i < heartCount; i++) {
      setTimeout(() => {
        setHearts((hearts) => [...hearts, {
          id: Date.now(),
          color: getRandomColor()
        }]);
      }, i * 200);
    }
  };

  const removeHeart = () => {
    const activeHearts = [...hearts];
    activeHearts.shift();

    setHearts(activeHearts);
  };

  return (
    <div className="like-wrapper">
      <button className="like-button" onClick={animateLike}>
        <Favorite />
      </button>

      {hearts.map(({ id, color }) => (
        <Heart key={id} color={color} removeHeart={removeHeart} />
      ))}
    </div>
  );
};

export default Like;
