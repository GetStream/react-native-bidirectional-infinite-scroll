import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { Message } from './utils';

export const ActivityItem = ({ item }) => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://images.sftcdn.net/images/t_app-cover-l,f_auto/p/befbcde0-9b36-11e6-95b9-00163ed833e7/260663710/the-test-fun-for-friends-screenshot.jpg'
        }}
        style={{
          height: 250
        }}
        />
        <Text style={styles.messageBubble}>{item.text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F5F5F5',
    margin: 10
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 5,
    fontSize: 15,
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
