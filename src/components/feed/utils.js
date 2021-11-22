const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
};

const getTimeSince = (dateTime) => {
  let secondsDiff = Math.floor((new Date() - new Date(dateTime).getTime()) / 1000);

  const days = Math.floor(secondsDiff / 86400);
  secondsDiff -= days * 86400;

  const hours = Math.floor(secondsDiff / 3600) % 24;
  secondsDiff -= hours * 3600;

  const minutes = Math.floor(secondsDiff / 60) % 60;
  secondsDiff -= minutes * 60;

  const seconds = Math.floor(secondsDiff % 60);

  let timeSince = '';

  if (days > 0) {
    timeSince += `${days}d `;
  }

  if (hours > 0) {
    timeSince += `${hours}h `;
  }

  if (minutes > 0) {
    timeSince += `${minutes}m `;
  }

  if (seconds > 0) {
    timeSince += `${seconds}s`;
  }

  return timeSince;
};

const isMobileOS = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;

  const isWindowsPhone = /windows phone/i.test(userAgent);
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

  return isWindowsPhone || isAndroid || isIOS;
};

const isCanvasBlank = (canvas) => {
  const context = canvas.getContext('2d');
  const pixelBuffer = new Uint32Array(
    context.getImageData(0, 0, canvas.width, canvas.height).data.buffer
  );
  return !pixelBuffer.some((color) => color !== 0);
};

export { getRandomColor, getTimeSince, isMobileOS, isCanvasBlank };
