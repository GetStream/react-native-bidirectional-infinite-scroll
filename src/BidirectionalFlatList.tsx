/* eslint-disable no-underscore-dangle */
import React, {
  MutableRefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList as FlatListType,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';

import { Virtuoso, VirtuosoHandle, VirtuosoProps } from 'react-virtuoso';
import type { Props, WebFlatListProps } from './types';

const styles = StyleSheet.create({
  indicatorContainer: {
    paddingVertical: 5,
    width: '100%',
  },
  refreshControl: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    paddingVertical: 10,
    position: 'absolute',
    width: '100%',
  },
});

const waiter = () => new Promise((resolve) => setTimeout(resolve, 500));
const dampingFactor = 5;
const pullToRefreshReleaseThreshold = 100;
const EmptyFunction = () => null;
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
    props: WebFlatListProps<T>,
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
      onEndReachedThreshold = 300,
      onRefresh,
      onScroll,
      onStartReached,
      onStartReachedThreshold = 300,
      refreshing,
      renderItem,
      showDefaultLoadingIndicators = true,
    } = props;

    const initialScrollIndex = propInitialScrollIndex
      ? propInitialScrollIndex
      : 0;
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const scrollerRef = useRef<HTMLElement | null>(null);
    const offsetFromBottom = useRef(1000000);
    const offsetFromTop = useRef(0);
    const prependingItems = useRef(false);
    const appendingItems = useRef(false);
    const [onStartReachedInProgress, setOnStartReachedInProgress] = useState(
      false
    );
    const [onEndReachedInProgress, setOnEndReachedInProgress] = useState(false);
    const [vData, setVDate] = useState(data);
    const firstItemIndex = useRef(0);
    const previousDataLength = useRef(data?.length || 0);
    const fadeAnimation = useRef(new Animated.Value(0)).current;
    const pan = useRef(new Animated.ValueXY()).current;
    const lastYValue = useRef(0);
    const panResponderActive = useRef(false);
    const onRefreshRef = useRef(onRefresh);
    const stopRefreshAction = useRef(() => {
      fadeAnimation.setValue(0);
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
    });
    const startRefreshAction = useRef(async () => {
      if (!scrollerRef.current) return;
      fadeAnimation.setValue(1);
      Animated.spring(pan, {
        toValue: { x: 0, y: 30 },
        useNativeDriver: true,
      }).start();

      prependingItems.current = true;
      await waiter();
      await onRefreshRef.current?.();

      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();

      fadeAnimation.setValue(0);
    });

    const resetPanHandlerAndScroller = () => {
      panResponderActive.current = false;
    };

    const startReached = async () => {
      if (
        !onStartReached ||
        prependingItems.current ||
        onStartReachedInProgress ||
        (inverted && !onEndReached) ||
        (!inverted && !onStartReached)
      ) {
        return;
      }

      prependingItems.current = true;
      setOnStartReachedInProgress(true);

      if (inverted) {
        await onEndReached?.();
      } else {
        await onStartReached?.();
      }
      setOnStartReachedInProgress(false);
    };

    const endReached = async () => {
      if (
        !onEndReached ||
        onEndReachedInProgress ||
        appendingItems.current ||
        (inverted && !onStartReached) ||
        (!inverted && !onEndReached)
      ) {
        return;
      }

      appendingItems.current = true;
      setOnEndReachedInProgress(true);
      if (inverted) {
        await onStartReached?.();
      } else {
        await onEndReached?.();
      }
      setOnEndReachedInProgress(false);
    };

    const panResponder = useRef(
      PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          if (prependingItems.current || !scrollerRef.current) {
            return;
          }

          if (offsetFromTop.current <= 0) {
            // @ts-ignore
            lastYValue.current = pan.y._value;
          } else {
            resetPanHandlerAndScroller();
          }
        },
        onPanResponderMove: (_, gestureState) => {
          if (!scrollerRef.current) return;

          if (
            offsetFromTop.current > 0 ||
            prependingItems.current ||
            (!panResponderActive.current && gestureState.dy < 0)
          ) {
            resetPanHandlerAndScroller();
            return;
          }

          if (lastYValue.current + gestureState.dy / dampingFactor < 0) {
            resetPanHandlerAndScroller();
            return;
          }

          panResponderActive.current = true;
          pan.setValue({
            x: 0,
            y: lastYValue.current + gestureState.dy / dampingFactor,
          });

          if (
            lastYValue.current + gestureState.dy / dampingFactor <
              pullToRefreshReleaseThreshold &&
            lastYValue.current + gestureState.dy / dampingFactor >
              -pullToRefreshReleaseThreshold
          ) {
            fadeAnimation.setValue(0);
          } else {
            fadeAnimation.setValue(1);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (!scrollerRef.current) return;

          resetPanHandlerAndScroller();

          if (
            lastYValue.current + gestureState.dy >
              pullToRefreshReleaseThreshold &&
            offsetFromTop.current <= 0
          ) {
            startRefreshAction.current();
          } else {
            stopRefreshAction.current();
          }
        },
      })
    ).current;

    const handleScroll: VirtuosoProps<unknown>['onScroll'] = (e) => {
      const targetElem = e.target as HTMLDivElement;
      offsetFromBottom.current =
        targetElem.scrollHeight -
        (targetElem.scrollTop + targetElem.clientHeight);
      offsetFromTop.current = targetElem.scrollTop;

      if (appendingItems.current || prependingItems.current) {
        return;
      }

      if (targetElem.scrollTop <= onStartReachedThreshold) {
        startReached();
      }

      if (offsetFromBottom.current <= onEndReachedThreshold) {
        endReached();
      }

      onScroll?.(e);
    };

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

    const itemContent = useCallback(
      (index: number) => {
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
            {renderItem({
              index,
              item: vData[indexInData],
              separators: {
                highlight: EmptyFunction,
                unhighlight: EmptyFunction,
                updateProps: EmptyFunction,
              },
            })}
            {indexInData !== vData.length && !!ItemSeparatorComponent && (
              <ItemSeparatorComponent />
            )}
          </>
        );
      },
      [vData?.length]
    );

    useEffect(() => {
      const updateVirtuoso = () => {
        if (!data?.length) {
          return;
        }

        let nextFirstItemIndex = firstItemIndex.current;
        if (prependingItems.current) {
          nextFirstItemIndex =
            firstItemIndex.current - (data.length - previousDataLength.current);
        }

        appendingItems.current = false;
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

    useEffect(() => {
      if (refreshing) {
        startRefreshAction.current();
      }
    }, [refreshing]);

    useImperativeHandle(
      ref,
      // @ts-ignore
      () => ({
        flashScrollIndicators: EmptyFunction,
        getNativeScrollRef: EmptyFunction,
        getScrollableNode: EmptyFunction,
        getScrollResponder: EmptyFunction,
        recordInteraction: EmptyFunction,
        scrollToEnd: (params = { animated: true }) => {
          const { animated } = params;
          if (!vData?.length) return;

          const index = inverted ? 0 : vData.length - 1;
          virtuosoRef.current?.scrollToIndex({
            behavior: animated ? 'smooth' : 'auto',
            index: index,
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

          if (inverted) {
            virtuosoRef.current?.scrollToIndex({
              behavior: animated ? 'smooth' : 'auto',
              index: vData.length - 1 - index,
            });
          } else {
            virtuosoRef.current?.scrollToIndex({
              behavior: animated ? 'smooth' : 'auto',
              index,
            });
          }
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
        scrollToOffset: EmptyFunction,
        setNativeProps: EmptyFunction,
      }),
      [virtuosoRef, inverted, vData]
    );

    useEffect(() => {
      onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    if (!vData?.length || vData?.length === 0) {
      return ListEmptyComponent ? <ListEmptyComponent /> : null;
    }

    const VirtuosoNode = (
      <Virtuoso<T>
        components={{
          Footer,
          Header,
        }}
        firstItemIndex={firstItemIndex.current}
        initialTopMostItemIndex={
          inverted ? vData.length - 1 - initialScrollIndex : initialScrollIndex
        }
        itemContent={itemContent}
        onScroll={handleScroll}
        overscan={300}
        ref={virtuosoRef}
        // @ts-ignore
        scrollerRef={(ref) => (scrollerRef.current = ref as HTMLElement)}
        totalCount={vData.length}
      />
    );

    if (!onRefresh) {
      return VirtuosoNode;
    }

    return (
      <>
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateX: 0 }, { translateY: pan.y }],
          }}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              {
                opacity: fadeAnimation,
                transform: [{ translateX: 0 }, { translateY: -30 }],
              },
              styles.refreshControl,
            ]}
          >
            <ActivityIndicator />
          </Animated.View>

          {VirtuosoNode}
        </Animated.View>
      </>
    );
  }
) as unknown) as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends unknown>(
  props: Props<T>
) => React.ReactElement;
