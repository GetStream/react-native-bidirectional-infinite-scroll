---
title: Troubleshooting
---

### Exception in native call from JS

Please upgrade to `@stream-io/flat-list-mvcp@0.10.0`

### Scroll is jumping, when new items are loaded in list

Please try adjusting (increasing) the [windowSize](https://reactnative.dev/docs/0.63/virtualizedlist#windowsize) on FlatList.
