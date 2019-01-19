import * as RNIap from 'react-native-iap';

const itemSkus = Platform.select({
  ios: [
    'com.footballwhoami.worldCup',
    'com.footballwhoami.championsLeague'
  ],
  android: [
    'com.footballwhoami.worldCup',
    'com.footballwhoami.championsLeague'
  ]
});