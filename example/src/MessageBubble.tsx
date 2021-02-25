import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Message } from './utils';

type Props = {
  item: Message;
};

export const MessageBubble: React.FC<Props> = ({ item }) => {
  if (item.isMyMessage) {
    return (
      <View
        key={`${item.id}`}
        style={[styles.messageBubble, styles.myMessageBubble]}
      >
        <Text style={styles.myMessageText}>{item.text}</Text>
      </View>
    );
  }

  return (
    <View key={`${item.id}`} style={styles.messageBubble}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: 300,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#F1F0F0',
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
    // borderColor: '#989898',
    // borderWidth: 1,
    backgroundColor: '#3784FF',
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: 'white',
    fontSize: 15,
  },
});
