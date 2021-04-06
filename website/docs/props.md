---
title: Props
slug: /props
---

This package is a wrapper around react-native's FlatList. So it accepts all the props from `FlatList`, except for [`maintainVisibleContentPosition`](https://reactnative.dev/docs/0.63/scrollview#maintainvisiblecontentposition). It has support for following additional props, to fine tune your infinite scroll.


### `onEndReached`

Called once when the scroll position gets close to end of list. This must return a promise.
You can `onEndReachedThreshold` as distance from end of list, when this function should be called.


| type     | default | required |
| -------- | ------- | -------- |
| function | null    | YES      |


### `onStartReached`

Called once when the scroll position gets close to begining of list. This must return a promise.
You can `onStartReachedThreshold` as distance from beginning of list, when this function should be called.

| type     | default | required |
| -------- | ------- | -------- |
| function | null    | YES      |

### `activityIndicatorColor`

Color for inline loading indicator
 
| type   | default | required |
| ------ | ------- | -------- |
| string | #000000 | NO       |

### `enableAutoscrollToTop`

Enable autoScrollToTop.
In chat type applications, you want to auto scroll to bottom, when new message comes it.

| type   | default | required |
| ------ | ------- | -------- |
| string | false   | NO       |

### `autoscrollToTopThreshold`

The scroll offset threshold, below which auto scrolling should occur.

:::info 

This prop only works, when `enableAutoscrollToTop` is set to true.

:::

| type     | default | required |
| -------- | ------- | -------- |
| number   | 100     | NO       |


### `onStartReachedThreshold`

Scroll offset from beginning of list, when onStartReached should be called.

| type     | default | required |
| -------- | ------- | -------- |
| number   | 10      | NO       |

### `onEndReachedThreshold`

Scroll distance from end of list, when onStartReached should be called.
Please note that this is different from onEndReachedThreshold of FlatList from react-native.

| type     | default | required |
| -------- | ------- | -------- |
| number   | 10      | NO       |

### `showDefaultLoadingIndicators`

If true, inline loading indicators will be shown

| type     | default | required |
| -------- | ------- | -------- |
| boolean  | true    | NO       |

### `HeaderLoadingIndicator`
  
Custom UI component for header inline loading indicator

| type       | default | required |
| --------   | ------- | -------- |
| Component  | [ActivityIndicator](https://reactnative.dev/docs/0.63/activityindicator)    | NO       |


### `FooterLoadingIndicator`
  
Custom UI component for footer inline loading indicator

| type       | default | required |
| --------   | ------- | -------- |
| Component  | [ActivityIndicator](https://reactnative.dev/docs/0.63/activityindicator)    | NO       |


### `ListHeaderComponent`
  
Custom UI component for header indicator of FlatList, which overrides the HeaderLoadingIndicator. Only used when `showDefaultLoadingIndicators` is false

| type       | default | required |
| --------   | ------- | -------- |
| Component  | null    | NO       |


### `ListFooterComponent`
  
Custom UI component for footer indicator of FlatList, which overrides the FooterLoadingIndicator. Only used when `showDefaultLoadingIndicators` is false

| type       | default | required |
| --------   | ------- | -------- |
| Component  | null    | NO       |


