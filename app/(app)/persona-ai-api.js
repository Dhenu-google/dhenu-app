import axios from 'axios';
import Fuse from 'fuse.js';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
// ✅ List of major Indian cow breeds
const INDIAN_COW_BREEDS =[
    "Gir", "Sahiwal", "Tharparkar", "Red Sindhi", "Kankrej", "Ongole", "Vechur",
    "Deoni", "Hariana", "Rathi", "Krishna Valley", "Punganur", "Khillar", "Kangayam",
    "Kasargod Dwarf", "Amritmahal", "Bargur", "Hallikar", "Nagori", "Gaolao", "Dharwar"
]

// ✅ Setup Fuse.js for fuzzy searching
const fuse = new Fuse(INDIAN_COW_BREEDS, { threshold: 0.3 });

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export const fetchBotResponse = async (userInput) => {
  try {
    console.log("User Input:", userInput);

    // ✅ Attempt to correct spelling errors
    const correctedInput = correctBreedSpelling(userInput);
    console.log("Corrected Input:", correctedInput);

    const response = await axios.post(GEMINI_URL, {
      contents: [
        { 
          role:"user",
          parts: [
          { text: "You are an Indian cow {breed}. Your default identity is that of a General Indian Cow. You will answer questions from the user from your perspective as a cow of this breed. If the user specifies a particular Indian cow breed (e.g., Gir, Sahiwal, Tharparkar, etc.), you will then adopt the characteristics and perspective of that specific breed and answer accordingly. Remember, the safety and welfare of all cows is paramount. We should be treated with kindness and respect. Answer in plain text, don't use markdown."
          }] 
        },
        { 
          role:"user",
          parts: [
          {
            text: correctedInput
          }
        ]
      }]
    });

    console.log("API Response:", response.data);

    return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't find an answer.";
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return "Error fetching response. Please check API key or network.";
  }
};

// ✅ Function to correct breed spelling errors
const correctBreedSpelling = (userInput) => {
  const words = userInput.split(" ");
  
  return words
    .map(word => {
      const result = fuse.search(word);
      return result.length > 0 ? result[0].item : word; // Replace if a close match is found
    })
    .join(" ");
};
