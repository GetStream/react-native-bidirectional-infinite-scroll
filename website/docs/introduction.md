---
title: Introduction
slug: /
---

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