# 📜 react-native-bidirectional-infinite-scroll

[![GitHub Workflow Status](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/GetStream/react-native-bidirectional-infinite-scroll/blob/main/LICENSE)
[![Compatibility](https://img.shields.io/badge/react--native%20--%20android%20%7C%20iOS-compatible-brightgreen)](https://reactnative.dev/)

Birectional infinite scroll for react-native, with **smooth scrolling**.

**[** Built with ♥ at [Stream](https://getstream.io/) **]**


<table>
  <tr>
    <td align='center' width="33%"><img src='https://user-images.githubusercontent.com/11586388/108675127-a5545680-74e6-11eb-89f9-b617b5ce6cc6.gif'/></td>
    <td align='center' width="33%"><img src='https://user-images.githubusercontent.com/11586388/108675105-9ff70c00-74e6-11eb-8abf-7c07b79338e2.gif'/></td>
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
