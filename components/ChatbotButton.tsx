import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Define message interface
interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

// MockAPI service to simulate chatbot responses
const getChatbotResponse = async (query: string): Promise<string> => {
  // This is just a mock response - in a real app you'd call your API
  const responses = [
    "Based on my analysis, your cows appear to be in good health based on their recorded metrics.",
    "For optimal milk production, ensure your cattle have access to fresh water and high-quality feed.",
    "Holstein cows typically produce more milk than other breeds, but Jerseys produce milk with higher butterfat content.",
    "Regular health check-ups are essential for maintaining a productive herd.",
    "The gestation period for cows is approximately 9 months (around 283 days)."
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      text: "Hello! I'm your cow care assistant. Ask me anything about cow health, breeding, or general care!",
      isUser: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length,
      text: inputValue,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Get response from API
      const response = await getChatbotResponse(inputValue);
      
      // Add bot response
      const botMessage: Message = {
        id: messages.length + 1,
        text: response,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording handlers
  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    // Here you would process the recording
    setIsRecording(false);
    
    // Mock response after voice recording
    setTimeout(() => {
      const userMessage: Message = {
        id: messages.length,
        text: "Voice message: How can I improve my cow's milk production?",
        isUser: true
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      setTimeout(() => {
        const botMessage: Message = {
          id: messages.length + 1,
          text: "For optimal milk production, ensure your cattle have access to fresh water and high-quality feed. Maintain regular milking schedules and ensure comfortable housing conditions with proper ventilation.",
          isUser: false
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsOpen(true);
      }, 1000);
    }, 500);
  };

  return (
    <>
      {/* Chatbot button that looks like Gemini */}
      <View style={styles.chatButtonContainer}>
        <LinearGradient
          colors={['rgba(218, 163, 255, 0.8)', 'rgba(151, 159, 250, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBorder}
        >
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => setIsOpen(true)}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {/*<Ionicons name="add" size={22} color="#666" style={styles.addIcon} />*/}
              <Text style={styles.buttonText}>Ask Gemini</Text>
              <TouchableOpacity 
                style={styles.micContainer}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent triggering the parent button
                  handleStartRecording();
                }}
              >
                <Ionicons name="mic" size={22} color="white" />
              </TouchableOpacity>
              <View style={styles.optionsContainer}>
                {/*<Ionicons name="options" size={22} color="#666" />*/}
              </View>
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Voice recording modal */}
      <Modal
        visible={isRecording}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRecording(false)}
      >
        <LinearGradient
          colors={['#002', '#005', '#00a']}
          style={styles.recordingModalContainer}
        >
          <View style={styles.recordingControls}>
            <Pressable 
              style={styles.holdButton}
              onPress={handleStopRecording}
            >
              <Ionicons name="pause" size={24} color="white" />
              <Text style={styles.controlText}>Hold</Text>
            </Pressable>
            
            <Pressable 
              style={styles.endButton}
              onPress={handleStopRecording}
            >
              <Ionicons name="close" size={24} color="white" />
              <Text style={styles.controlText}>End</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </Modal>

      {/* Full screen chatbot modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cattle Assistant</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message) => (
              <View 
                key={message.id} 
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.botMessage
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))}
            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text>Thinking...</Text>
              </View>
            )}
          </ScrollView>
          
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.inputContainer}
          >
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Type a message..."
              placeholderTextColor="#666"
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSend}
              disabled={!inputValue.trim() || isLoading}
            >
              <Ionicons 
                name="send" 
                size={22} 
                color={!inputValue.trim() || isLoading ? '#ccc' : '#2196F3'} 
              />
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chatButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  gradientBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    padding: 3.25, // Border thickness
    shadowColor: 'rgba(218, 163, 255, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  chatButton: {
    flex: 1,
    borderRadius: 27,
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
  },
  addIcon: {
    marginRight: 10,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  micContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#8e79ee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  optionsContainer: {
    padding: 4,
  },
  recordingModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
  },
  holdButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 30,
  },
  endButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#e6f7ff',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    fontSize: 16,
  },
  loadingContainer: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f1f1f1',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
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
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 