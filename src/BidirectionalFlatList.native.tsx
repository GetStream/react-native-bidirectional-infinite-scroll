import React, { MutableRefObject, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList as FlatListType,
  ScrollViewProps,
  StyleSheet,
  View,
} from 'react-native';
import { FlatList } from '@stream-io/flat-list-mvcp';

import type { Props } from './types';

const styles = StyleSheet.create({
  indicatorContainer: {
    paddingVertical: 5,
    width: '100%',
  },
});

/**
 * Note:
 * - `onEndReached` and `onStartReached` must return a promise.
 * - `onEndReached` and `onStartReached` only get called once, per content length.
 * - maintainVisibleContentPosition is fixed, and can't be modified through props.
 * - doesn't accept `ListFooterComponent` via prop, since it is occupied by `FooterLoadingIndicator`.
 *    Set `showDefaultLoadingIndicators` to use `ListFooterComponent`.
 * - doesn't accept `ListHeaderComponent` via prop, since it is occupied by `HeaderLoadingIndicator`
 *    Set `showDefaultLoadingIndicators` to use `ListHeaderComponent`.
 */
export const BidirectionalFlatList = (React.forwardRef(
  <T extends unknown>(
    props: Props<T>,
    ref:
      | ((instance: FlatListType<T> | null) => void)
      | MutableRefObject<FlatListType<T> | null>
      | null
  ) => {
    const {
      activityIndicatorColor = 'black',
      autoscrollToTopThreshold = 100,
      data,
      enableAutoscrollToTop,
      FooterLoadingIndicator,
      HeaderLoadingIndicator,
      ListHeaderComponent,
      ListFooterComponent,
      onEndReached = () => Promise.resolve(),
      onEndReachedThreshold = 10,
      onScroll,
      onStartReached = () => Promise.resolve(),
      onStartReachedThreshold = 10,
      showDefaultLoadingIndicators = true,
    } = props;
    const [onStartReachedInProgress, setOnStartReachedInProgress] = useState(
      false
    );
    const [onEndReachedInProgress, setOnEndReachedInProgress] = useState(false);

    const onStartReachedTracker = useRef<Record<number, boolean>>({});
    const onEndReachedTracker = useRef<Record<number, boolean>>({});

    const onStartReachedInPromise = useRef<Promise<void> | null>(null);
    const onEndReachedInPromise = useRef<Promise<void> | null>(null);

    const maybeCallOnStartReached = () => {
      // If onStartReached has already been called for given data length, then ignore.
      if (data?.length && onStartReachedTracker.current[data.length]) {
        return;
      }

      if (data?.length) {
        onStartReachedTracker.current[data.length] = true;
      }

      setOnStartReachedInProgress(true);
      const p = () =>
        new Promise<void>((resolve) => {
          onStartReachedInPromise.current = null;
          setOnStartReachedInProgress(false);
          resolve();
        });

      if (onEndReachedInPromise.current) {
        onEndReachedInPromise.current.finally(() => {
          onStartReachedInPromise.current = onStartReached().then(p);
        });
      } else {
        onStartReachedInPromise.current = onStartReached().then(p);
      }
    };

    const maybeCallOnEndReached = () => {
      // If onEndReached has already been called for given data length, then ignore.
      if (data?.length && onEndReachedTracker.current[data.length]) {
        return;
      }

      if (data?.length) {
        onEndReachedTracker.current[data.length] = true;
      }

      setOnEndReachedInProgress(true);
      const p = () =>
        new Promise<void>((resolve) => {
          onStartReachedInPromise.current = null;
          setOnEndReachedInProgress(false);
          resolve();
        });

      if (onStartReachedInPromise.current) {
        onStartReachedInPromise.current.finally(() => {
          onEndReachedInPromise.current = onEndReached().then(p);
        });
      } else {
        onEndReachedInPromise.current = onEndReached().then(p);
      }
    };

    const handleScroll: ScrollViewProps['onScroll'] = (event) => {
      // Call the parent onScroll handler, if provided.
      onScroll?.(event);

      const offset = event.nativeEvent.contentOffset.y;
      const visibleLength = event.nativeEvent.layoutMeasurement.height;
      const contentLength = event.nativeEvent.contentSize.height;

      // Check if scroll has reached either start of end of list.
      const isScrollAtStart = offset < onStartReachedThreshold;
      const isScrollAtEnd =
        contentLength - visibleLength - offset < onEndReachedThreshold;

      if (isScrollAtStart) {
        maybeCallOnStartReached();
      }

      if (isScrollAtEnd) {
        maybeCallOnEndReached();
      }
    };

    const renderHeaderLoadingIndicator = () => {
      if (!showDefaultLoadingIndicators) {
        if (ListHeaderComponent) {
          return <ListHeaderComponent />;
        } else {
          return null;
        }
      }

      if (!onStartReachedInProgress) return null;

      if (HeaderLoadingIndicator) {
        return <HeaderLoadingIndicator />;
      }

      return (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator color={activityIndicatorColor} size={'small'} />
        </View>
      );
    };

    const renderFooterLoadingIndicator = () => {
      if (!showDefaultLoadingIndicators) {
        if (ListFooterComponent) {
          return <ListFooterComponent />;
        } else {
          return null;
        }
      }

      if (!onEndReachedInProgress) return null;

      if (FooterLoadingIndicator) {
        return <FooterLoadingIndicator />;
      }

      return (
        <View style={styles.indicatorContainer}>
          <ActivityIndicator color={activityIndicatorColor} size={'small'} />
        </View>
      );
    };

    return (
      <>
        <FlatList<T>
          {...props}
          ListFooterComponent={renderFooterLoadingIndicator}
          ListHeaderComponent={renderHeaderLoadingIndicator}
          maintainVisibleContentPosition={{
            autoscrollToTopThreshold: enableAutoscrollToTop
              ? autoscrollToTopThreshold
              : undefined,
            minIndexForVisible: 1,
          }}
          onEndReached={null}
          onScroll={handleScroll}
          progressViewOffset={50}
          ref={ref}
        />
      </>
    );
  }
) as unknown) as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends unknown>(
  props: Props<T>
) => React.ReactElement;
