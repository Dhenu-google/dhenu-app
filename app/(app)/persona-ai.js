import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import ChatBubble from '@/app/(app)/persona-ai-ChatBubble';
import { fetchBotResponse } from '@/app/(app)/persona-ai-api';

const MooAIChat = ({ messages, setMessages, isOpen }) => {
  const [input, setInput] = useState('');
  const scrollViewRef = useRef(null); // Reference for ScrollView

  // Auto-scroll when the chat is opened or reopened
  useEffect(() => {
    if (isOpen && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 100); // Delay to ensure rendering is complete
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
    <View style={styles.container}>
      <ScrollView style={styles.chatBox} ref={scrollViewRef}>
        {messages.map((msg, index) => (
          <ChatBubble key={index} message={msg.text} sender={msg.sender} />
        ))}
      </ScrollView>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="Ask about Indian cow breeds..."
      />
      <Button title="Send" onPress={handleSend} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  chatBox: { flex: 1, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 5 },
});

export default MooAIChat;
