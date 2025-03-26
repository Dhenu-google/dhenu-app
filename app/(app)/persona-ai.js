import React, { useState } from 'react';
import { View, TextInput, Button, ScrollView, Text, StyleSheet } from 'react-native';
import ChatBubble from '@/app/(app)/persona-ai-ChatBubble';
import { fetchBotResponse } from '@/app/(app)/persona-ai-api';

const MooAIChat = () => {
  const [messages, setMessages] = useState([
    { text: 'Welcome to Moo AI! 🐄 Ask me about Indian cow breeds.\n\n1️⃣ Learn about a breed’s origin, history & socio-economic benefits.\n2️⃣ Don’t know a breed? I can list all or filter by region.\n3️⃣ No cruelty-related queries allowed.', sender: 'bot' },
  ]);
  const [input, setInput] = useState('');

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
      <ScrollView style={styles.chatBox}>
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
