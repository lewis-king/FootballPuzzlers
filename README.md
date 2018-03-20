**Football - Who am I? / Football Puzzlers**


A Football(soccer) trivia guess who style app in which you will be given certain facts about a player and you must guess who is being described.
The questions are predominantly based around the Premier League with the majority within the last decade era.

**Built using React-Native backed by a Realm DB and utilising Fastlane for continuous deployment.**


**Run**
First start and emulator or connect a device!

`react-native run-android`

**Android logs**

`react-native log-android`

**Clean Rebuild**

`rm -rf node_modules && npm install && react-native link`

**Generate App Icon**

Install GraphicsMagick and ImageMagick, then:
`yo rn-toolbox:assets --icon ./src/resources/images/Football_Who_Am_I.png`

**Generate Android Artefact**

In android dir:
`./gradlew assembleRelease`

**Release iOS Beta**

In ios/fastlane dir:
`fastlane ios beta`