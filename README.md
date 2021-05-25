# 📜 React Native Bi-directional Infinite Scroll

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/GetStream/react-native-bidirectional-infinite-scroll/blob/main/LICENSE)
[![NPM](https://img.shields.io/npm/v/react-native-bidirectional-infinite-scroll.svg)](https://www.npmjs.com/package/react-native-bidirectional-infinite-scroll)
[![Compatibility](https://img.shields.io/badge/react--native%20--%20android%20%7C%20iOS-compatible-brightgreen)](https://reactnative.dev/)

**Implement bidirectional infinite smooth scroll using React Native**

**[** Built with ♥ at [<strong>Stream</strong>](https://getstream.io/) **]**

![Vishal - Article 01](https://user-images.githubusercontent.com/11586388/109156507-38082600-7771-11eb-82c4-2ca0dec97545.png)

## Introduction

[FlatList](https://reactnative.dev/docs/flatlist) by react-native only allows infinite scroll in one direction (using `onEndReached`). This package adds capability on top of FlatList to allow infinite scroll from both directions, and also maintains **smooth scroll** UX.

- Accepts prop `onStartReached` & `onEndReached`, which you can use to load more results.
- Calls to onEndReached and onStartReached have been optimized.
- Inline loading Indicators, which can be customized as well.
- Uses [flat-list-mvcp](https://github.com/GetStream/flat-list-mvcp#maintainvisiblecontentposition-prop-support-for-android-react-native) to maintain scroll position or smooth scroll UX.

<table>
  <tr>
    <td align='center' width="33%"><img src='https://user-images.githubusercontent.com/11586388/109138261-77774800-775a-11eb-806b-2add75755af7.gif' height="600" /></td>
    <td align='center' width="33%"><img src='https://user-images.githubusercontent.com/11586388/109139686-16507400-775c-11eb-893f-8cccfb47f9d7.gif' height="600"/></td>
  </tr>
  <tr></tr>
  <tr>
    <td align='center'>
        <strong>iOS</strong>
    </td>
    <td align='center'>
        <strong>Android</strong>
    </td>
  </tr>
</table>

## 🛠 Installation and Usage

Please check the complete docs at https://getstream.github.io/react-native-bidirectional-infinite-scroll/

## ✍ Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 🎗 License

MIT
