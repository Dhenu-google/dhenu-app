import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView, TextInput, ScrollView, KeyboardAvoidingView, Platform, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, addDoc, serverTimestamp, doc} from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
import { getAuth } from 'firebase/auth';
import Fuse from 'fuse.js';
import {franc } from 'franc';
import { DB_API_URL } from '@/config';

const { GoogleGenerativeAI } = require("@google/generative-ai");
const GOOGLE_GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(`${GOOGLE_GEMINI_API_KEY}`);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// const prompt = "Explain how AI works in a few words";
// const result = await model.generateContent(prompt);

// Define message interface
interface Message {
  id: number;
  text: string;
  isUser: boolean;
}


const VALID_BREEDS = [
    "Gir", "Sahiwal", "Tharparkar", "Red Sindhi", "Kankrej", "Ongole", "Vechur",
    "Deoni", "Hariana", "Rathi", "Krishna Valley", "Punganur", "Khillar", "Kangayam",
    "Kasargod Dwarf", "Amritmahal", "Bargur", "Hallikar", "Nagori", "Gaolao", "Dharwar"
];

const correctBreed = (userInput:string) => {
  const fuse = new Fuse(VALID_BREEDS, {
    threshold: 0.3, // Adjust this to approximate a similarity score of >= 70
    distance: 100,  // Maximum distance for matching
    keys: [],       // No keys since it's a simple array
  });
  const result = fuse.search(userInput);
  return result.length >0 ? result[0].item : null;
};

const LANGUAGE_MAP: { [key: string]: string } = {
  "hin": "Hindi",
  "ben": "Bengali",
  "tel": "Telugu",
  "mar": "Marathi",
  "tam": "Tamil",
  "urd": "Urdu",
  "guj": "Gujarati",
  "mal": "Malayalam",
  "kan": "Kannada",
  "ori": "Odia",
  "pan": "Punjabi",
  "asm": "Assamese",
  "san": "Sanskrit",
  "kok": "Konkani",
  "bod": "Bodo",
  "nep": "Nepali",
  "mai": "Maithili",
  "sind": "Sindhi",
  "kas": "Kashmiri",
  "mni": "Manipuri",
  "bho": "Bhojpuri",
};

const normalizeTopics = (topics: string[]): string[] => {
  const mapping: { [key: string]: string } = {
    "general": "general",
    "gen": "general",
    "general info": "general",
    "information": "general",
    "info": "general",
    "care": "care",
    "management": "care",
    "feeding": "care",
    "nutrition": "care",
    "health care": "care",
    "breeding": "breeding",
    "reproduction": "breeding",
    "repro": "breeding",
    "mating": "breeding",
    "disease": "disease",
    "diseases": "disease",
    "health": "disease",
    "illness": "disease",
    "sickness": "disease",
    "prevention": "disease",
  };

  const normalized: string[] = [];

  topics.forEach((t) => {
    const key = mapping[t.trim().toLowerCase()]; // Normalize the topic
    if (key && !normalized.includes(key)) {
      normalized.push(key); // Add only unique normalized topics
    }
  });

  return normalized;
};


const fuzzyMatch = (word: string, targetList: string[], threshold: number = 0.8): boolean => {
  const fuse = new Fuse(targetList, {
    includeScore: true,
    threshold: 1 - threshold / 100, // Convert percentage threshold to Fuse.js threshold
  });

  const result = fuse.search(word);

  if (result.length === 0) {
    return false; // No match found
  }

  const { score } = result[0];
  return score !== undefined && score <= 1 - threshold / 100; // Return true if the match score is within the threshold
};


const extractGeneralSubtopics = (query: string): string[] => {
  const queryWords = query.toLowerCase().split(/\s+/); // Split query into words
  const subtopics: string[] = [];

  const targetKeywords: { [key: string]: string[] } = {
    origin: ["origin", "history", "evolution"],
    physical: ["physical", "size", "trait", "characteristic"],
    importance: ["importance", "economic", "cultural", "benefit", "advantage"],
  };

  for (const [subtopic, keywords] of Object.entries(targetKeywords)) {
    for (const word of queryWords) {
      if (fuzzyMatch(word, keywords)) {
        subtopics.push(subtopic);
        break; // Avoid adding the same subtopic multiple times
      }
    }
  }

  return subtopics;
};

const extractCareSubtopics = (query: string): string[] => {
  const queryWords = query.toLowerCase().split(/\s+/); // Split query into words
  const subtopics: string[] = [];

  const targetKeywords: { [key: string]: string[] } = {
    feeding: ["feed", "nutrition", "diet", "food"],
    environment: ["environment", "climate", "weather"],
    shelter: ["shelter", "housing", "pen", "management"],
  };

  for (const [subtopic, keywords] of Object.entries(targetKeywords)) {
    for (const word of queryWords) {
      if (fuzzyMatch(word, keywords)) {
        subtopics.push(subtopic);
        break; // Avoid adding the same subtopic multiple times
      }
    }
  }

  return subtopics;
};

const extractBreedingSubtopics = (query: string): string[] => {
  const queryWords = query.toLowerCase().split(/\s+/); // Split query into words
  const subtopics: string[] = [];

  const targetKeywords: { [key: string]: string[] } = {
    reproduction: ["maturity", "reproductive", "gestation", "cycle"],
    techniques: ["technique", "insemination", "crossbreed", "natural", "artificial"],
    calving: ["calving", "birth", "neonatal", "newborn", "calf", "parturation"],
    genetics: ["genetic", "trait", "improvement"],
  };

  for (const [subtopic, keywords] of Object.entries(targetKeywords)) {
    for (const word of queryWords) {
      if (fuzzyMatch(word, keywords)) {
        subtopics.push(subtopic);
        break; // Avoid adding the same subtopic multiple times
      }
    }
  }

  return subtopics;
};

const extractDiseaseSubtopics = (query: string): string[] => {
  const queryWords = query.toLowerCase().split(/\s+/); // Split query into words
  const subtopics: string[] = [];

  const targetKeywords: { [key: string]: string[] } = {
    common: ["common", "infection", "symptom", "illness", "disease"],
    diagnosis: ["diagnosis", "treatment", "veterinary", "medicine"],
    prevention: ["prevent", "vaccine", "immunization", "biosecurity"],
    management: ["long-term", "management", "screening", "record"],
  };

  for (const [subtopic, keywords] of Object.entries(targetKeywords)) {
    for (const word of queryWords) {
      if (fuzzyMatch(word, keywords)) {
        subtopics.push(subtopic);
        break; // Avoid adding the same subtopic multiple times
      }
    }
  }

  return subtopics;
};

const updateStateFromQuery = (query: string, conversationState: { currentBreed: string | null; currentTopics: string[] }) => {
  const queryLower = query.toLowerCase();

  // Update breed only if explicitly mentioned using regex for exact match
  for (const breed of VALID_BREEDS) {
    const pattern = new RegExp(`\\b${breed.toLowerCase()}\\b`, 'i'); // Case-insensitive exact match
    if (pattern.test(queryLower)) {
      conversationState.currentBreed = breed;
      break;
    }
  }

  // Update topics based on query words; merge new topics with existing ones
  const topicsFound = normalizeTopics(query.split(/\s+/)); // Split query into words and normalize topics
  if (topicsFound.length > 0) {
    for (const topic of topicsFound) {
      if (!conversationState.currentTopics.includes(topic)) {
        conversationState.currentTopics.push(topic); // Add only unique topics
      }
    }
  }
};

const detectLanguageByUTF = (text: string): string => {
  // Define UTF-8 character ranges for each language
  const languageRanges: { [key: string]: RegExp } = {
    Hindi: /[\u0900-\u097F]/, // Devanagari script
    Marathi: /[\u0900-\u097F]/, // Devanagari script (same as Hindi)
    Kannada: /[\u0C80-\u0CFF]/, // Kannada script
    Bengali: /[\u0980-\u09FF]/, // Bengali script
    English: /[a-zA-Z]/, // Latin script
  };

  // Check the text against each language's character range
  for (const [language, regex] of Object.entries(languageRanges)) {
    if (regex.test(text)) {
      return language;
    }
  }

  // Default to "Unknown" if no match is found
  return "Unknown";
};


const constructPrompt = (
  cowBreed: string,
  topics: string[],
  userQuery: string
): string => {
  // Detailed subtopic prompts for each main topic
  const generalPrompts: { [key: string]: string } = {
    origin: `
### Origin & History of ${cowBreed}:
Provide a detailed explanation of the origin and historical development of the ${cowBreed} breed.
`,
    physical: `
### Physical Characteristics of ${cowBreed}:
Describe the body structure, size, and distinctive traits of the ${cowBreed} breed.
`,
    importance: `
### Economic and Cultural Importance of ${cowBreed}:
Explain the benefits and cultural significance of raising ${cowBreed} cattle.
`,
  };

  const carePrompts: { [key: string]: string } = {
    feeding: `
### Feeding and Nutrition for ${cowBreed}:
Provide recommendations for diet, feeding schedule, and essential nutrients for ${cowBreed}.
`,
    environment: `
### Environment and Climate for ${cowBreed}:
Describe the ideal climate conditions and environmental management practices for ${cowBreed}.
`,
    shelter: `
### Shelter and Housing for ${cowBreed}:
Explain best practices for cow housing and shelter design, including maintenance tips.
`,
  };

  const breedingPrompts: { [key: string]: string } = {
    reproduction: `
### Reproductive Cycle & Maturity for ${cowBreed}:
Provide details on the age of maturity, gestation period, and key reproductive features of ${cowBreed}.
`,
    techniques: `
### Breeding Techniques for ${cowBreed}:
Discuss natural versus artificial insemination and recommended crossbreeding strategies for ${cowBreed}.
`,
    calving: `
### Calving and Neonatal Care for ${cowBreed}:
Offer guidelines for calving and care instructions for newborn calves of the ${cowBreed} breed.
`,
    genetics: `
### Genetic Traits & Improvements for ${cowBreed}:
Describe desired genetic traits in breeding pairs and strategies for improving herd quality in ${cowBreed}.
`,
  };

  const diseasePrompts: { [key: string]: string } = {
    common: `
### Common Diseases Affecting ${cowBreed}:
List and explain common diseases and their symptoms in ${cowBreed}.
`,
    diagnosis: `
### Diagnosis & Treatment for ${cowBreed}:
Provide recommended veterinary treatments and diagnostic procedures for diseases affecting ${cowBreed}.
`,
    prevention: `
### Preventive Measures for ${cowBreed}:
Detail vaccination schedules and biosecurity measures to prevent diseases in ${cowBreed}.
`,
    management: `
### Long-term Health Management for ${cowBreed}:
Explain strategies for regular health screening and record-keeping for ${cowBreed}.
`,
  };

  // Full prompt fallback for each main topic
  const fullPrompts: { [key: string]: string } = {
    general: `
## General Information about ${cowBreed}:
Provide comprehensive details covering origin, physical traits, and the benefits of raising ${cowBreed}.
`,
    care: `
## Care and Management of ${cowBreed}:
Provide an overview of the ideal climate, feeding recommendations, and sheltering practices for ${cowBreed}.
`,
    breeding: `
## Breeding Information for ${cowBreed}:
Provide a complete overview covering reproductive features, breeding conditions, and ideal crossbreeding strategies for ${cowBreed}.
`,
    disease: `
## Common Diseases & Prevention for ${cowBreed}:
Provide comprehensive information on common diseases, symptoms, treatments, and preventive measures for ${cowBreed}.
`,
  };

  const normalizedTopics = normalizeTopics(topics);
  const selectedPrompts: string[] = [];

  for (const topic of normalizedTopics) {
    if (topic === "general") {
      const subtopics = extractGeneralSubtopics(userQuery);
      if (subtopics.length > 0) {
        for (const sub of subtopics) {
          if (generalPrompts[sub]) {
            selectedPrompts.push(generalPrompts[sub]);
          }
        }
      } else {
        selectedPrompts.push(fullPrompts["general"]);
      }
    } else if (topic === "care") {
      const subtopics = extractCareSubtopics(userQuery);
      if (subtopics.length > 0) {
        for (const sub of subtopics) {
          if (carePrompts[sub]) {
            selectedPrompts.push(carePrompts[sub]);
          }
        }
      } else {
        selectedPrompts.push(fullPrompts["care"]);
      }
    } else if (topic === "breeding") {
      const subtopics = extractBreedingSubtopics(userQuery);
      if (subtopics.length > 0) {
        for (const sub of subtopics) {
          if (breedingPrompts[sub]) {
            selectedPrompts.push(breedingPrompts[sub]);
          }
        }
      } else {
        selectedPrompts.push(fullPrompts["breeding"]);
      }
    } else if (topic === "disease") {
      const subtopics = extractDiseaseSubtopics(userQuery);
      if (subtopics.length > 0) {
        for (const sub of subtopics) {
          if (diseasePrompts[sub]) {
            selectedPrompts.push(diseasePrompts[sub]);
          }
        }
      } else {
        selectedPrompts.push(fullPrompts["disease"]);
      }
    }
  }

  const detectedLanguage = detectLanguageByUTF(userQuery);
  if (detectedLanguage !== "Unknown") {
    selectedPrompts.push(`
### Language Preference:
The user prefers responses in ${detectedLanguage}. Please provide the answer in ${detectedLanguage}.
`);
  }

  return selectedPrompts.join("\n");
};

const isQueryEthicallyProblematic = (query: string): boolean => {
  const disallowedKeywords = [
    "cooking",
    "butchering",
    "beef",
    "eating",
    "juicy",
    "consumption",
    "meat",
  ];
  const queryLower = query.toLowerCase();

  for (const word of disallowedKeywords) {
    if (queryLower.includes(word)) {
      return true; // Query contains a disallowed keyword
    }
  }

  return false; // Query is ethically acceptable
};

const generateResponse = async (
  cowBreed: string,
  topics: string[],
  userInput: string,
  conversationState: { currentBreed: string | null; currentTopics: string[] }
): Promise<string> => {
  // Check if the query is ethically problematic
  if (isQueryEthicallyProblematic(userInput)) {
    return "I'm sorry, but I cannot assist with that request.";
  }

  // Update the conversation state based on the user input
  updateStateFromQuery(userInput, conversationState);

  // Get the current breed and topics from the conversation state
  const currentBreed = conversationState.currentBreed || cowBreed;
  const currentTopics = conversationState.currentTopics.length > 0 ? conversationState.currentTopics : topics;

  // Construct the user prompt
  const userPrompt = constructPrompt(currentBreed, currentTopics, userInput);

  try {
    // Call the API to generate a response
    const response = await fetch(`${DB_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_input: userPrompt }),
    });

    if (!response.ok) {
      console.error('Error from API:', response.statusText);
      return "Sorry, I couldn't process your request. Please try again.";
    }

    const data = await response.json();
    return data.response || "Sorry, I couldn't process your request. Please try again.";
  } catch (error) {
    console.error('Error generating response:', error);
    return "Sorry, I couldn't process your request. Please try again.";
  }
};

// MockAPI service to simulate chatbot responses
const getChatbotResponse = async (query: string): Promise<string> => {
  // Initialize conversation state
  const conversationState = { currentBreed: null, currentTopics: [] };

  // Call generateResponse function to get the chatbot's response
  const response = await generateResponse(
    conversationState.currentBreed || "general", // Use current breed from state or default to "Unknown"
    conversationState.currentTopics.length > 0 ? conversationState.currentTopics : ["general"], // Use current topics from state or default to "general"
    query, // User input
    conversationState // Pass the conversation state
  );

  return response;
  
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
  const [conversationBuffer, setConversationBuffer] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null); // Reference for ScrollView

  // Scroll to the bottom when the modal opens or messages change
  useEffect(() => {
    if (isOpen && scrollViewRef.current) {
      // Delay the scroll to ensure the modal is fully rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [isOpen, messages]);

  const saveConversationToFirestore = async(messages:Message[]) => {
    try{
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if(!currentUser){
        console.error("No User found to be logged in ");
        return false;
      }
      const userID = currentUser.uid;
      const userRef = doc(db,"users",userID);
      const conversationsRef = collection(userRef, 'conversations');
      // Create a new conversation document
      const conversationDoc = await addDoc(conversationsRef, {
        summary: messages.map((msg)=>msg.text).join("\n"), // Combine all messages into a summary
        timestamp: serverTimestamp(),
      });

      // Save individual messages as a subcollection
      const messagesRef = collection(conversationDoc, 'messages');
      for (const msg of messages) {
        await addDoc(messagesRef, {
          content: msg.text,
          isUser: msg.isUser,
          timestamp: serverTimestamp(),
        });
      }
      console.log('Conversation saved successfully!');
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length,
      text: inputValue,
      isUser: true
    };
    
    setMessages(prev => [...prev, userMessage]);

    //Append User Message to the conversation buffer
    setConversationBuffer((prev)=> [...prev, `User: ${inputValue}`]);
    setInputValue('');
    setIsLoading(true);
    
    try {

      // Get response from API
      const response = await getChatbotResponse(inputValue);
      
      // Add bot response to the local state
      const botMessage: Message = {
        id: messages.length + 1,
        text: response,
        isUser: false
      };
      
      setMessages(prev => [...prev, botMessage]);

      // APpend bot respose to the converstaion buffer
      setConversationBuffer(prev=> [...prev, `Bot: ${response}`]);

    } catch (error) {
      console.error('Error getting response:', error);
      
      // Add error message to the local state
      const errorMessage: Message = {
        id: messages.length + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        isUser: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setConversationBuffer(prev=> [...prev, `Bot : Couldn't Process, try Again`]);
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
          colors={['#a67b6d', '#5D4037']}
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
              <Text style={styles.buttonText}>Ask Moo AI</Text>
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
        onRequestClose={() => {saveConversationToFirestore(messages),setIsOpen(false)}}
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>EMoo AI</Text>
            <View style={{ width: 24 }} />
          </View>
          
          <ScrollView
            style={styles.messagesContainer}
            ref={scrollViewRef} // Attach the ref to ScrollView
          >
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
                color={!inputValue.trim() || isLoading ? '#ccc' : '#5D4037'} 
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
    shadowColor: 'rgba(93, 64, 55, 0.1)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
  },
  chatButton: {
    flex: 1,
    borderRadius: 27,
    backgroundColor: '#faebd7',
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