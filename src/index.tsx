import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
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

type Props<T> = FlatListProps<T> & {
  onEndReached: () => Promise<void>;
  onStartReached: () => Promise<void>;
  activityIndicatorColor?: string;
  onStartReachedThreshold?: number;
  onEndReachedThreshold?: number;
  showDefaultLoadingIndicators?: boolean;
  HeaderLoadingIndicator?: React.ComponentType;
  FooterLoadingIndicator?: React.ComponentType;
  ListHeaderComponent?: React.ComponentType;
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
const BidirectionalFlatList = <T extends any>(props: Props<T>) => {
  const {
    activityIndicatorColor = 'black',
    data,
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
    const p = () => {
      return new Promise<void>((resolve) => {
        onStartReachedInPromise.current = null;
        setOnStartReachedInProgress(false);
        resolve();
      });
    };

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
    const p = () => {
      return new Promise<void>((resolve) => {
        onStartReachedInPromise.current = null;
        setOnStartReachedInProgress(false);
        resolve();
      });
    };

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
      <FlatList
        {...props}
        progressViewOffset={50}
        ListHeaderComponent={renderHeaderLoadingIndicator}
        ListFooterComponent={renderFooterLoadingIndicator}
        onEndReached={null}
        onScroll={handleScroll}
        // @ts-ignore
        maintainVisibleContentPosition={{
          autoscrollToTopThreshold: undefined,
          minIndexForVisible: 1,
        }}
      />
    </>
  );
};

export { BidirectionalFlatList as FlatList };
