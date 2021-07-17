import type { RefAttributes } from 'react';
import type { FlatList, FlatListProps } from 'react-native';

export type WebFlatListProps<T> = Props<T> & {
  ListEmptyComponent: React.ComponentType;
  onScroll: (event: React.UIEvent<'div', UIEvent>) => void;
};

export type Props<T = unknown> = Omit<
  FlatListProps<T>,
  'maintainVisibleContentPosition'
> &
  RefAttributes<FlatList> & {
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
     * If `enableAutoscrollToTop` is true, the scroll threshold below which auto scrolling should occur.
     */
    autoscrollToTopThreshold?: number;
    /**
     * Enable autoScrollToTop.
     * In chat type applications, you want to auto scroll to bottom, when new message comes it.
     */
    enableAutoscrollToTop?: boolean;
    /** Custom UI component for footer inline loading indicator */
    FooterLoadingIndicator?: React.ComponentType;
    /** Custom UI component for header inline loading indicator */
    HeaderLoadingIndicator?: React.ComponentType;
    /** Custom UI component for footer indicator of FlatList. Only used when `showDefaultLoadingIndicators` is false */
    ListFooterComponent?: React.ComponentType;
    /** Custom UI component for header indicator of FlatList. Only used when `showDefaultLoadingIndicators` is false */
    ListHeaderComponent?: React.ComponentType;
    /**
     * Scroll distance from end of list, when onStartReached should be called.
     * Please note that this is different from onEndReachedThreshold of FlatList from react-native.
     */
    onEndReachedThreshold?: number;
    /** Scroll distance from beginning of list, when onStartReached should be called. */
    onStartReachedThreshold?: number;
    /** If true, inline loading indicators will be shown. Default - true */
    showDefaultLoadingIndicators?: boolean;
  };
