import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { FlatList } from 'react-native-bidirectional-infinite-scroll';
import { MessageBubble } from './MessageBubble';
import { Message, queryMoreMessages } from './utils';

const App = () => {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const flRef = useRef(null);
  useEffect(() => {
    const initChat = async () => {
      const initialMessages = await queryMoreMessages(50, null, null);
      if (!initialMessages) return;

      setMessages(initialMessages);
    };

    initChat();
  }, []);

  const loadMoreOlderMessages = async () => {
      const newMessages = await queryMoreMessages(10, null, messages[messages.length - 1].id);
      setMessages((m) => {
        return m.concat(newMessages);
      });
  };

  const loadMoreRecentMessages = useCallback(async () => {
    const newMessages = await queryMoreMessages(10, messages[0].id, null);
    console.log('loadMoreRecentMessages before ', messages[0].id)
    setMessages((m) => {
      return newMessages.concat(m);
    });
  }, [messages]);

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
        ref={flRef}
        onEndReached={loadMoreOlderMessages}
        onStartReached={loadMoreRecentMessages}
        // inverted
        // onRefresh={loadMoreRecentMessages}
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
