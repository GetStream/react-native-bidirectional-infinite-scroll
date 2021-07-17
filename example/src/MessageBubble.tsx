import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Message } from './utils';

type Props = {
  item: Message;
  index: number;
};

export const MessageBubble: React.FC<Props> = ({ item, index }) => {
  if (item.isMyMessage) {
    return (
      <View style={styles.container} key={`item-${item.id}`}>
        <View
          style={[styles.messageBubble, styles.myMessageBubble]}
        >
          <Text style={styles.myMessageText}>{item.text}</Text>
          <Text style={[styles.myMessageText, {
            marginTop: 10,
            fontWeight: 'bold'
          }]}>ID: {item.id} Index: {index}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} key={`item-${item.id}`}>
      <View style={styles.messageBubble}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={[styles.messageText, {
          marginTop: 10,
          fontWeight: 'bold'
        }]}>ID: {item.id} Index: {index}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  messageBubble: {
    maxWidth: 300,
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    backgroundColor: '#F1F0F0',
    height: 100
  },
  myMessageBubble: {
    alignSelf: 'flex-end',
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
