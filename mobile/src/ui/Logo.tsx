import { Image } from 'expo-image';

const logo = require('../../assets/brand/logo.png');
const RATIO = 652 / 180;

/**
 * The 2019 "who?ami" wordmark: the "?" doubles as the "o" of "who". Montserrat Bold in the brand
 * gradient, rebuilt as vector (design/art/logo-whoami.svg) and rendered to PNG at 3x.
 */
export function Logo({ height = 40 }: { height?: number }) {
  return (
    <Image
      source={logo}
      style={{ height, width: height * RATIO }}
      contentFit="contain"
      accessibilityRole="header"
      accessibilityLabel="Football Who Am I"
    />
  );
}
