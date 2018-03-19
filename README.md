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