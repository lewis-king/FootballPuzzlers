**Football - Who am I? / Football Puzzlers**


A Football(soccer) trivia guess who style app in which you will be given certain facts about a player and you must guess who is being described.
The questions are predominantly based around the Premier League with the majority within the last decade era.

**Built using React-Native backed by a Realm DB and utilising Fastlane for continuous deployment.**

**Play Store:** https://play.google.com/store/apps/details?id=com.footballtrivia

**App Store:**
https://itunes.apple.com/gb/app/football-who-am-i/id1338147291

**Run Android**
First start an emulator or connect a device!

`react-native run-android`

**Run iOS**
First Open XCode

`react-native run-ios`

**Android logs**

`react-native log-android`

**Clean Rebuild**

`rm -rf node_modules && npm install && react-native link`

**Generate Android Artefact**

In android dir:
`./gradlew assembleRelease`

**Release iOS Beta**

In ios/fastlane dir:
`fastlane ios beta`

**Dev Tools**
`react-devtools`

**react-native-text-gradient text strings must be rendered within a <Text> component**
Usage with rn >= 0.56.0
Wait until https://github.com/facebook/react/pull/13211 will be merged or patch react-native to remove failing invariant checks

`$ node node_modules/react-native-text-gradient/patch-rn.j`s