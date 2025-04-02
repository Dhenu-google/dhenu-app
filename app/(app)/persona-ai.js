import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, ScrollView, StyleSheet, ImageBackground, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import ChatBubble from '@/app/(app)/persona-ai-ChatBubble';
import { fetchBotResponse } from '@/app/(app)/persona-ai-api';
import { Ionicons } from '@expo/vector-icons';

const MooAIChat = ({ messages, setMessages, isOpen }) => {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (isOpen && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: 'user' }];
    setMessages(newMessages);
    setInput('');

    const botReply = await fetchBotResponse(input);
    setMessages([...newMessages, { text: botReply, sender: 'bot' }]);
  };

  return (
    <ImageBackground 
      source={require('@/assets/images/chat.png')}
      style={styles.backgroundImage}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.chatBox} ref={scrollViewRef}>
          {messages.map((msg, index) => (
            <ChatBubble key={index} message={msg.text} sender={msg.sender} />
          ))}
        </ScrollView>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about Indian cow breeds..."
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Ionicons 
              name="send" 
              size={22} 
              color={!input.trim() ? '#ccc' : '#5D4037'} 
            />
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: { 
    flex: 1,
    backgroundColor: 'transparent',
  },
  chatBox: { 
    flex: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#5D4037',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MooAIChat;
