import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Modal, View, TextInput, KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';

export default function TabChatbotButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ type: 'user' | 'bot', text: string }>>([]);

  const handleSend = async () => {
    if (!message.trim()) return;

    // Add user message to chat
    setChatHistory(prev => [...prev, { type: 'user', text: message }]);
    
    // TODO: Connect to your different AI model here
    // For now, just echo back a response
    const botResponse = "This is EMoo AI. Your message: " + message;
    setChatHistory(prev => [...prev, { type: 'bot', text: botResponse }]);
    
    setMessage('');
  };

  return (
    <>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => setIsVisible(true)}
      >
        <View style={styles.searchBarContainer}>
          <Text style={styles.placeholderText}>Ask EMoo AI...</Text>
          <View style={styles.micIconContainer}>
            <Ionicons name="mic" size={24} color="#4070F4" />
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <ThemedView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Ionicons name="bulb" size={24} color="#4070F4" />
                <ThemedText style={styles.modalTitle}>EMoo AI</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView style={styles.chatContainer}>
              {chatHistory.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageContainer,
                    msg.type === 'user' ? styles.userMessage : styles.botMessage,
                  ]}
                >
                  <ThemedText style={[
                    styles.messageText,
                    msg.type === 'user' ? styles.userMessageText : styles.botMessageText
                  ]}>{msg.text}</ThemedText>
                </View>
              ))}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={message}
                onChangeText={setMessage}
                placeholder="Ask me anything..."
                placeholderTextColor="#999"
                multiline
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Ionicons
                  name="send"
                  size={24}
                  color={message.trim() ? '#4070F4' : '#999'}
                />
              </TouchableOpacity>
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chatButton: {
    position: 'absolute',
    right: 20,
    left: 20,
    bottom: 20,
    borderRadius: 50,
    backgroundColor: '#faebd7',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#9516f0',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
  },
  micIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#4070F4',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4070F4',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#FFF',
  },
  botMessageText: {
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  input: {
    flex: 1,
    marginRight: 8,
    padding: 8,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
  },
}); 