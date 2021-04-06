---
title: How it works
slug: /how-it-works
---

This section will walk you through the hurdles of implementing bidirectional infinite scroll and how its solved by this package.
​
### Support for `onStartReached`
[FlatList](https://reactnative.dev/docs/flatlist) from React Native has built-in support for infinite scroll in a single direction (from the end of the list). You can add a prop `onEndReached`on `FlatList`. This function gets called when your scroll is near the end of the list, and thus you can append more items to the list from this function. You can Google for **React Native infinite scrolling**, and you will find plenty of examples for this. Unfortunately, the `FlatList` doesn't provide any similar prop for `onStartReached` for infinite scrolling in other directions.
​
We have added support for this prop as part of this package by simply adding the `onScroll` handler on `FlatList`, and executing the callback function (`onStartReached`) when the scroll is near the start of the list. If you take a look at the implementation of [VirtualizedList](https://github.com/facebook/react-native/blob/master/Libraries/Lists/VirtualizedList.js), you will notice that `onEndReached`function gets called only once per content length. That's there for a good purpose - to avoid redundant function calls on every scroll position change. Similar optimizations have been done for `onStartReached` within this package.
​
### Race condition between `onStartReached` and `onEndReached`

To maintain a smooth scrolling experience, we need to manage the execution order of `onStartReached` and `onEndReached`. Because if both the callbacks happen at (almost) the same time, which means items will be added to the list from both directions. This may result in scroll jump, and that's not a good user experience. Thus it's essential to make sure one callback waits for the other callback to finish.
​
### `onStartReachedThreshold` and `onEndReachedThreshold`

`FlatList` from React Native has a support for the prop `onEndReachedThreshold`, which is [documented here](https://reactnative.dev/docs/flatlist#onendreachedthreshold)
​
> How far from the end (in units of visible length of the list) the bottom edge of the list must be from the end of the content to trigger the `onEndReached` callback.


Instead, it's easier to have a fixed value offset (distance from the end of the list) to trigger one of these callbacks. Thus we can maintain these two values within our implementation. So `onStartReachedThreshold` and `onEndReachedThreshold` props accept the number - distance from the end of the list to trigger one of these callbacks.
​
### Smooth scrolling experience
`FlatList` from React Native accepts a prop - [maintainVisibleContentPosition](https://reactnative.dev/docs/scrollview#maintainvisiblecontentposition), which makes sure your scroll doesn't jump to the end of the list when more items are added to the list. But this prop is only supported on iOS for now. So taking some inspiration from this [PR](https://github.com/facebook/react-native/pull/29466), we published our separate package to add support for this prop on Android - [flat-list-mvcp](https://github.com/GetStream/flat-list-mvcp#maintainvisiblecontentposition-prop-support-for-android-react-native). And thus `@stream-io/flat-list-mvcp` is a dependency of the `react-native-bidirectional-scroll` package.
​