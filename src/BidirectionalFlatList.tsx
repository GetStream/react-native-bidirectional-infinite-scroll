import React, {
  MutableRefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList as FlatListType,
  StyleSheet,
  View,
} from 'react-native';

import { Virtuoso, VirtuosoHandle, VirtuosoProps } from 'react-virtuoso';
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
// eslint-disable-next-line react/display-name
export const BidirectionalFlatList = (React.forwardRef(
  <T extends unknown>(
    props: Props<T>,
    ref:
      | ((instance: FlatListType<T> | null) => void)
      | MutableRefObject<FlatListType<T> | null>
      | null
  ) => {
    const {
      activityIndicatorColor,
      autoscrollToTopThreshold = 50,
      data,
      enableAutoscrollToTop = false,
      FooterLoadingIndicator,
      HeaderLoadingIndicator,
      initialScrollIndex: propInitialScrollIndex,
      inverted,
      ItemSeparatorComponent,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      onEndReached,
      onScroll,
      onStartReached,
      renderItem,
      showDefaultLoadingIndicators = true,
    } = props;

    const initialScrollIndex = propInitialScrollIndex
      ? propInitialScrollIndex
      : 0;
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const offsetFromBottom = useRef(1000000);
    const prependingItems = useRef(false);
    const appendingItems = useRef(false);

    const [onStartReachedInProgress, setOnStartReachedInProgress] = useState(
      false
    );
    const [onEndReachedInProgress, setOnEndReachedInProgress] = useState(false);

    const [vData, setVDate] = useState(data);
    const firstItemIndex = useRef(0);
    const previousDataLength = useRef(data?.length || 0);

    const startReached = () => {
      if (prependingItems.current) return;
      prependingItems.current = true;
      setOnStartReachedInProgress(true);
      if (inverted) {
        onEndReached();
      } else {
        onStartReached();
      }
    };

    const endReached = () => {
      appendingItems.current = true;
      setOnEndReachedInProgress(true);
      if (inverted) {
        onStartReached();
      } else {
        onEndReached();
      }
    };

    useEffect(() => {
      const updateVirtuoso = () => {
        if (!data?.length) {
          return;
        }

        let nextFirstItemIndex = firstItemIndex.current;
        if (prependingItems.current === true) {
          nextFirstItemIndex =
            firstItemIndex.current - (data.length - previousDataLength.current);
        }

        prependingItems.current = false;
        previousDataLength.current = data.length;

        firstItemIndex.current = nextFirstItemIndex;
        setVDate(() => data);

        if (
          enableAutoscrollToTop &&
          offsetFromBottom.current < autoscrollToTopThreshold
        ) {
          setTimeout(() => {
            virtuosoRef.current?.scrollToIndex({
              behavior: 'smooth',
              index: data.length,
            });
          }, 0);
        }
      };

      updateVirtuoso();
    }, [enableAutoscrollToTop, autoscrollToTopThreshold, data, setVDate]);

    const Footer = () =>
      ListFooterComponent ? (
        <ListFooterComponent />
      ) : onEndReachedInProgress ? (
        FooterLoadingIndicator ? (
          <FooterLoadingIndicator />
        ) : showDefaultLoadingIndicators ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator color={activityIndicatorColor} size={'small'} />
          </View>
        ) : null
      ) : null;

    const Header = () =>
      ListHeaderComponent ? (
        <ListHeaderComponent />
      ) : onStartReachedInProgress ? (
        HeaderLoadingIndicator ? (
          <HeaderLoadingIndicator />
        ) : showDefaultLoadingIndicators ? (
          <View style={styles.indicatorContainer}>
            <ActivityIndicator color={activityIndicatorColor} size={'small'} />
          </View>
        ) : null
      ) : null;

    const handleScroll: VirtuosoProps<unknown>['onScroll'] = (e) => {
      const targetElem = e.target;
      offsetFromBottom.current =
        // @ts-ignore
        targetElem.scrollHeight -
        // @ts-ignore
        (targetElem.scrollTop + targetElem.clientHeight);

      // @ts-ignore
      onScroll?.(e);
    };

    const itemContent = (index: number) => {
      if (!renderItem) {
        console.warn('Please specify renderItem prop');
        return null;
      }

      if (!vData) {
        return null;
      }

      const indexInData = inverted
        ? vData.length - 1 - (index + Math.abs(firstItemIndex.current))
        : index + Math.abs(firstItemIndex.current);

      return (
        <>
          {/* @ts-ignore */}
          {renderItem({ index, item: vData[indexInData] })}
          {indexInData !== vData.length && !!ItemSeparatorComponent && (
            <ItemSeparatorComponent />
          )}
        </>
      );
    };

    useImperativeHandle(
      ref,
      () => ({
        flashScrollIndicators: () => null,
        getNativeScrollRef: () => null,
        getScrollableNode: () => null,
        getScrollResponder: () => null,
        recordInteraction: () => null,
        // @ts-ignore
        scrollToEnd: ({ animated }: { animated?: boolean | null }) => {
          if (!vData?.length) return;

          // eslint-disable-next-line babel/no-unused-expressions
          inverted
            ? virtuosoRef.current?.scrollToIndex({
                behavior: animated ? 'smooth' : 'auto',
                index: 0,
              })
            : virtuosoRef.current?.scrollToIndex({
                behavior: animated ? 'smooth' : 'auto',
                index: vData.length - 1,
              });
        },
        scrollToIndex: ({
          animated,
          index,
        }: {
          index: number;
          animated?: boolean | null;
        }) => {
          if (!vData) {
            return;
          }

          // eslint-disable-next-line babel/no-unused-expressions
          inverted
            ? virtuosoRef.current?.scrollToIndex({
                behavior: animated ? 'smooth' : 'auto',
                index: vData.length - 1 - index,
              })
            : virtuosoRef.current?.scrollToIndex({
                behavior: animated ? 'smooth' : 'auto',
                index,
              });
        },
        scrollToItem: ({
          animated,
          item,
        }: {
          item: T;
          animated?: boolean | null;
        }) => {
          if (!vData) {
            return;
          }

          const index = vData.findIndex((d) => d === item);
          virtuosoRef.current?.scrollToIndex({
            behavior: animated ? 'smooth' : 'auto',
            index,
          });
        },
        scrollToOffset: () => null,
        setNativeProps: () => null,
      }),
      [virtuosoRef, inverted, vData]
    );

    if (!vData?.length || vData?.length === 0) {
      // @ts-ignore
      return <ListEmptyComponent />;
    }

    return (
      <Virtuoso<T>
        components={{
          Footer,
          Header,
        }}
        endReached={endReached}
        firstItemIndex={firstItemIndex.current}
        followOutput={enableAutoscrollToTop ? 'smooth' : false}
        initialTopMostItemIndex={
          inverted ? vData.length - 1 - initialScrollIndex : initialScrollIndex
        }
        itemContent={itemContent}
        onScroll={handleScroll}
        ref={virtuosoRef}
        startReached={startReached}
        totalCount={vData.length}
      />
    );
  }
) as unknown) as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends unknown>(
  props: Props<T>
) => React.ReactElement;
