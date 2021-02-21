import React, { useState } from 'react';
import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';

const ListItem = ({ item }: { item: number }) => (
  <View style={styles.listItem}>
    <Text>List item: {item}</Text>
  </View>
);

export default () => {
  const [numbers, setNumbers] = useState(Array.from(Array(10).keys()));

  const addToEnd = () => {
    setNumbers((prev) => {
      const additionalNumbers = Array.from(Array(5).keys()).map(
        (n) => n + prev[prev.length - 1] + 1
      );

      return prev.concat(additionalNumbers);
    });
  };

  const addToStart = () => {
    setNumbers((prev) => {
      const additionalNumbers = Array.from(Array(5).keys())
        .map((n) => prev[0] - n - 1)
        .reverse();

      return additionalNumbers.concat(prev);
    });
  };

  const onStartReached = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        addToStart();
        resolve();
      }, 500);
    });
  };

  const onEndReached = () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        addToEnd();
        resolve();
      }, 500);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.listContainer}>
        <FlatList
          data={numbers}
          keyExtractor={(item) => item.toString()}
          onStartReached={onStartReached}
          onEndReached={onEndReached}
          renderItem={ListItem}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 4,
    flexGrow: 1,
    flexShrink: 1,
  },
  listItem: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A8A8A8',
    backgroundColor: '#F5F5F5',
  },
});
