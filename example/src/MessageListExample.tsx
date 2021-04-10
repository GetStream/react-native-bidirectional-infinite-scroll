import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { ActivityItem } from './ActivityItem';
import { queryMoreMessages } from './utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Message } from './utils';

const App = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const viewConfigRef = useRef({
    itemVisiblePercentThreshold: 90,
    minimumViewTime: 200,
  });
  useEffect(() => {
    const initChat = async () => {
      const initialMessages = await queryMoreMessages(30);
      if (!initialMessages) return;

      setMessages(initialMessages);
    };

    initChat();
  }, []);

  const loadMoreOlderMessages = async () => {
    const newMessages = await queryMoreMessages(10);
    setMessages((m) => {
      return m.concat(newMessages);
    });
  };

  const loadMoreRecentMessages = async () => {
    const newMessages = await queryMoreMessages(10);
    setMessages((m) => {
      return newMessages.concat(m);
    });
  };

  if (!messages.length) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat between two users</Text>
      </View>
      <FlatList
        data={messages}
        onEndReached={loadMoreOlderMessages}
        onStartReached={loadMoreRecentMessages}
        renderItem={ActivityItem}
        viewabilityConfig={viewConfigRef.current}
        scrollEventThrottle={20}
        bounces={false}
        numColumns={1}
        ListFooterComponent={() => <ActivityIndicator size="large" />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomColor: '#BEBEBE',
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  safeArea: {
    flex: 1,
    backgroundColor: '#b478ed',
  },
  sendMessageButton: {
    width: '100%',
    padding: 20,
    backgroundColor: '#FF4500',
    alignItems: 'center',
  },
  sendButtonTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default App;
