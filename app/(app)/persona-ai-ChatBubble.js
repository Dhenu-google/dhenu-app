import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatBubble = ({ message, sender }) => {
  return (
    <View style={[styles.bubble, sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.text, sender === 'user' ? styles.userText : styles.botText]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    padding: 12,
    marginVertical: 5,
    borderRadius: 16,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: 'rgb(100, 78, 13)',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: 'rgb(93, 64, 55)',
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 16,
  },
  userText: {
    color: '#fff',
  },
  botText: {
    color: '#fff',
  },
});

export default ChatBubble;
