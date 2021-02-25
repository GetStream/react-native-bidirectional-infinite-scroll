import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { MessageBubble } from './MessageBubble';
import { Message, queryMoreMessages } from './utils';

const App = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  useEffect(() => {
    const initChat = async () => {
      const initialMessages = await queryMoreMessages(50);
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
        inverted
        onEndReached={loadMoreOlderMessages}
        onStartReached={loadMoreRecentMessages}
        renderItem={MessageBubble}
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
