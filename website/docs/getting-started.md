---
title: Installation and Usage
slug: /installation
---

## Setup

#### NPM

```sh
$ npm i react-native-bidirectional-infinite-scroll @stream-io/flat-list-mvcp
```

#### Yarn

```sh
$ yarn add react-native-bidirectional-infinite-scroll @stream-io/flat-list-mvcp
```

## Usage

Please check the [example app](https://github.com/GetStream/react-native-bidirectional-infinite-scroll/tree/main/example) for working demo.

```js
import { FlatList } from "react-native-bidirectional-infinite-scroll";

export const App = () => {
  // All your business logic here

  return (
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
  )
}
```
