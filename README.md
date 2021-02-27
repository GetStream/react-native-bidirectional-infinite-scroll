# 📜 React Native Bi-directional Infinite Scroll

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/GetStream/react-native-bidirectional-infinite-scroll/blob/main/LICENSE)
[![Npm Package](https://img.shields.io/badge/npm--package-v0.1.0-blue)](https://www.npmjs.com/package/react-native-bidirectional-infinite-scroll)
[![Compatibility](https://img.shields.io/badge/react--native%20--%20android%20%7C%20iOS-compatible-brightgreen)](https://reactnative.dev/)

**[** Built with ♥ at [<strong><img src="https://i.ibb.co/3FfvvPD/unnamed-1.jpg" height="13px" /> Stream</strong>](https://getstream.io/) **]**

![Vishal - Article 01](https://user-images.githubusercontent.com/11586388/109156507-38082600-7771-11eb-82c4-2ca0dec97545.png)


[FlatList](https://reactnative.dev/docs/flatlist) by react-native only allows infinite scroll in one direction (using `onEndReached`). This package adds capability on top of FlatList to allow infinite scroll from both directions, and also maintains **smooth scroll** UX.

**Features**

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

## 🛠 Installation

```sh
yarn add react-native-bidirectional-infinite-scroll @stream-io/flat-list-mvcp
```

## 🔮 Usage

Please check the [example app](https://github.com/GetStream/react-native-bidirectional-infinite-scroll/tree/main/example) for working demo.

```jsx
import { FlatList } from "react-native-bidirectional-infinite-scroll";

<FlatList
    data={numbers}
    renderItem={ListItem}
    keyExtractor={(item) => item.toString()}
    onStartReached={onStartReached} // required, should return a promise
    onEndReached={onEndReached} // required, should return a promise
    showDefaultLoadingIndicators={true} // optional
    onStartReachedThreshold={10} // optional
    onEndReachedThreshold={10} // optional
    activityIndicatorColor={'black'} // optional
    HeaderLoadingIndicator={() => { /** Your loading indicator */ }} // optional
    FooterLoadingIndicator={() => { /** Your loading indicator */ }} // optional
    enableAutoscrollToTop={false} // optional | default - false
    // You can use any other prop on react-native's FlatList
/>

```

**Note**:
- `onEndReached` and `onStartReached` only get called once, per content length.
- `onEndReached` and `onStartReached` must return a promise.
- `maintainVisibleContentPosition` is fixed, and can't be modified through props.
- doesn't accept `ListFooterComponent` via prop, since it is occupied by `FooterLoadingIndicator`


## ✍ Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 🎗 License

MIT
