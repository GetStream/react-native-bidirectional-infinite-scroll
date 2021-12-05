import React, { MutableRefObject, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList as FlatListType,
  FlatListProps,
  ScrollViewProps,
  StyleSheet,
  View,
} from 'react-native';
import { FlatList } from '@stream-io/flat-list-mvcp';

const styles = StyleSheet.create({
  indicatorContainer: {
    paddingVertical: 5,
    width: '100%',
  },
});

export type Props<T> = Omit<
  FlatListProps<T>,
  'maintainVisibleContentPosition'
> & {
  /**
   * Called once when the scroll position gets close to end of list. This must return a promise.
   * You can `onEndReachedThreshold` as distance from end of list, when this function should be called.
   */
  onEndReached: () => Promise<void>;
  /**
   * Called once when the scroll position gets close to begining of list. This must return a promise.
   * You can `onStartReachedThreshold` as distance from beginning of list, when this function should be called.
   */
  onStartReached: () => Promise<void>;
  /** Color for inline loading indicator */
  activityIndicatorColor?: string;
  /**
   * Enable autoScrollToTop.
   * In chat type applications, you want to auto scroll to bottom, when new message comes it.
   */
  enableAutoscrollToTop?: boolean;
  /**
   * If `enableAutoscrollToTop` is true, the scroll threshold below which auto scrolling should occur.
   */
  autoscrollToTopThreshold?: number;
  /** Scroll distance from beginning of list, when onStartReached should be called. */
  onStartReachedThreshold?: number;
  /**
   * Scroll distance from end of list, when onStartReached should be called.
   * Please note that this is different from onEndReachedThreshold of FlatList from react-native.
   */
  onEndReachedThreshold?: number;
  /** If true, inline loading indicators will be shown. Default - true */
  showDefaultLoadingIndicators?: boolean;
  /** Custom UI component for header inline loading indicator */
  HeaderLoadingIndicator?: React.ComponentType;
  /** Custom UI component for footer inline loading indicator */
  FooterLoadingIndicator?: React.ComponentType;
  /** Custom UI component for header indicator of FlatList. Only used when `showDefaultLoadingIndicators` is false */
  ListHeaderComponent?: React.ComponentType;
  /** Custom UI component for footer indicator of FlatList. Only used when `showDefaultLoadingIndicators` is false */
  ListFooterComponent?: React.ComponentType;
};
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
  <T extends any>(
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

      const onFinally = () => {
        onStartReachedInPromise.current = onStartReached().then(p);
      };

      const p = () => {
        return new Promise<void>((resolve) => {
          onStartReachedInPromise.current = null;
          setOnStartReachedInProgress(false);
          resolve();
        });
      };

      if (onEndReachedInPromise.current) {
        onEndReachedInPromise.current.then(onFinally, onFinally);
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

      const onFinally = () => {
        onEndReachedInPromise.current = onEndReached().then(p);
      };

      const p = () => {
        return new Promise<void>((resolve) => {
          onStartReachedInPromise.current = null;
          setOnEndReachedInProgress(false);
          resolve();
        });
      };

      if (onStartReachedInPromise.current) {
        onStartReachedInPromise.current.then(onFinally, onFinally);
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
          <ActivityIndicator size={'small'} color={activityIndicatorColor} />
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
          <ActivityIndicator size={'small'} color={activityIndicatorColor} />
        </View>
      );
    };

    return (
      <>
        <FlatList<T>
          {...props}
          ref={ref}
          progressViewOffset={50}
          ListHeaderComponent={renderHeaderLoadingIndicator}
          ListFooterComponent={renderFooterLoadingIndicator}
          onEndReached={null}
          onScroll={handleScroll}
          maintainVisibleContentPosition={{
            autoscrollToTopThreshold: enableAutoscrollToTop
              ? autoscrollToTopThreshold
              : undefined,
            minIndexForVisible: 1,
          }}
        />
      </>
    );
  }
) as unknown) as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends any>(
  props: Props<T>
) => React.ReactElement;
