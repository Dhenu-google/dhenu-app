import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatBubble = ({ message, sender }) => {
  return (
    <View style={[styles.bubble, sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#D1E7DD',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#F8D7DA',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
});

export default ChatBubble;
