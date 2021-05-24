/* eslint-disable no-underscore-dangle */
import React, {
  MutableRefObject,
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
import type { Props } from './types';

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

type WebFlatListProps<T> = Props<T> & {
  onScroll: (event: React.UIEvent<'div', UIEvent>) => void;
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
    const [firstItemIndex, setFirstItemIndex] = useState(10 ** 7);
    const previousDataLength = useRef(data?.length || 0);
    const fadeAnimation = useRef(new Animated.Value(0)).current;
    const pan = useRef(new Animated.ValueXY()).current;
    const lastYValue = useRef(0);
    const panResponderActive = useRef(false);
    const resetPanHandlerAndScroller = () => {
      if (scrollerRef.current) {
        scrollerRef.current.style.overflow = 'auto';
      }
      panResponderActive.current = false;
    };
    const startReached = async () => {
      if (
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
        onEndReachedInProgress ||
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
          scrollerRef.current.style.overflow = 'hidden';
          pan.setValue({
            x: 0,
            y: lastYValue.current + gestureState.dy / dampingFactor,
          });

          if (
            lastYValue.current + gestureState.dy / dampingFactor < 35 &&
            lastYValue.current + gestureState.dy / dampingFactor > -35
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
            lastYValue.current + gestureState.dy > 35 &&
            offsetFromTop.current <= 0
          ) {
            fadeAnimation.setValue(1);
            Animated.spring(pan, {
              toValue: { x: 0, y: 30 },
              useNativeDriver: true,
            }).start();

            simulateRefreshAction.current?.();
          } else {
            fadeAnimation.setValue(0);
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }).start();
          }
        },
      })
    ).current;

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

    const handleScroll: VirtuosoProps<unknown>['onScroll'] = (e) => {
      const targetElem = e.target as HTMLDivElement;
      offsetFromBottom.current =
        targetElem.scrollHeight -
        (targetElem.scrollTop + targetElem.clientHeight);
      offsetFromTop.current = targetElem.scrollTop;

      if (
        inverted &&
        !appendingItems.current &&
        !prependingItems.current &&
        startReached
      ) {
        if (targetElem.scrollTop <= onEndReachedThreshold) {
          startReached();
        }

        if (offsetFromBottom.current <= onStartReachedThreshold && endReached) {
          endReached();
        }
      } else {
        if (targetElem.scrollTop <= onStartReachedThreshold && endReached) {
          endReached();
        }

        if (offsetFromBottom.current <= onEndReachedThreshold && startReached) {
          startReached();
        }
      }

      onScroll?.(e);
    };

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

    const itemContent = (index: number) => {
      if (!renderItem) {
        console.warn('Please specify renderItem prop');
        return null;
      }

      if (!vData) {
        return null;
      }

      const indexInData = inverted
        ? vData.length - 1 - (index - firstItemIndex)
        : index - firstItemIndex;

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

    const onRefreshRef = useRef(onRefresh);

    const simulateRefreshAction = useRef(async () => {
      if (!scrollerRef.current || prependingItems.current) return;

      prependingItems.current = true;
      await waiter();
      await onRefreshRef.current?.();
      scrollerRef.current.style.overflow = 'auto';

      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();

      fadeAnimation.setValue(0);
    });

    useEffect(() => {
      const updateVirtuoso = () => {
        if (!data?.length) {
          return;
        }

        let nextFirstItemIndex = firstItemIndex;
        if (prependingItems.current === true) {
          nextFirstItemIndex =
            firstItemIndex - (data.length - previousDataLength.current);
          setFirstItemIndex(nextFirstItemIndex);
        }

        setVDate(() => data);
        prependingItems.current = false;
        appendingItems.current = false;
        previousDataLength.current = data.length;

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
    }, [enableAutoscrollToTop, autoscrollToTopThreshold, data, firstItemIndex]);

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

          if (inverted) {
            virtuosoRef.current?.scrollToIndex({
              behavior: animated ? 'smooth' : 'auto',
              index: 0,
            });
          } else {
            virtuosoRef.current?.scrollToIndex({
              behavior: animated ? 'smooth' : 'auto',
              index: vData.length - 1,
            });
          }
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
        scrollToOffset: () => null,
        setNativeProps: () => null,
      }),
      [virtuosoRef, inverted, vData]
    );

    useEffect(() => {
      onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    if (!vData?.length || vData?.length === 0) {
      // @ts-ignore
      return <ListEmptyComponent />;
    }

    if (!onRefresh) {
      return (
        <Virtuoso<T>
          components={{
            Footer,
            Header,
          }}
          endReached={endReached}
          firstItemIndex={firstItemIndex}
          initialTopMostItemIndex={
            inverted
              ? vData.length - 1 - initialScrollIndex
              : initialScrollIndex
          }
          itemContent={itemContent}
          onScroll={handleScroll}
          overscan={300}
          ref={virtuosoRef}
          // @ts-ignore
          scrollerRef={(ref) => (scrollerRef.current = ref)}
          startReached={startReached}
          totalCount={vData.length}
        />
      );
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

          <Virtuoso<T>
            components={{
              Footer,
              Header,
            }}
            endReached={endReached}
            firstItemIndex={firstItemIndex}
            initialTopMostItemIndex={
              inverted
                ? vData.length - 1 - initialScrollIndex
                : initialScrollIndex
            }
            itemContent={itemContent}
            onScroll={handleScroll}
            overscan={300}
            ref={virtuosoRef}
            // @ts-ignore
            scrollerRef={(ref) => (scrollerRef.current = ref)}
            startReached={startReached}
            totalCount={vData.length}
          />
        </Animated.View>
      </>
    );
  }
) as unknown) as BidirectionalFlatListType;

type BidirectionalFlatListType = <T extends unknown>(
  props: Props<T>
) => React.ReactElement;
