import { isMobileOS } from './utils';

const config = {
  SWIPE_DURATION: 400, // ms
  MOBILE_BREAKPOINT: 840, // px (width)
  PLAY_IN_BACKGROUND: true, // true = all players will be playing in the background
  BLUR: {
    ENABLED: true, // enable/disable blur effect
    STILL_FRAME: isMobileOS() // only draws the first blurred video frame when enabled
  }
};

export default config;
