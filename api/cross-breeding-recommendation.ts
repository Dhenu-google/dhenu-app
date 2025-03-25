import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

// Promisify exec for async/await
const execAsync = promisify(exec);

const VALID_BREEDS = [
  "Gir", "Sahiwal", "Tharparkar", "Red Sindhi", "Kankrej", "Ongole", "Vechur",
  "Deoni", "Hariana", "Rathi", "Krishna Valley", "Punganur", "Khillar", "Kangayam",
  "Kasargod Dwarf", "Amritmahal", "Bargur", "Hallikar", "Nagori", "Gaolao", "Dharwar"
];

// Function to run the Python script and get the recommendation
async function runPythonScript(breed: string): Promise<{ recommendation: string, audioPath: string }> {
  try {
    // Set the path to the Python script
    const scriptPath = path.join(process.cwd(), 'breeding_model', 'script1.py');
    
    // Set the environment variables needed by the script
    const env = {
      ...process.env,
      PYTHONIOENCODING: 'utf-8',
    };

    // Create a temporary file to store the output
    const outputFile = path.join(process.cwd(), 'breeding_model', `output_${Date.now()}.json`);
    
    // Execute the Python script with the breed as an argument
    const command = `python ${scriptPath} --breed "${breed}" --output "${outputFile}"`;
    
    // Execute the command
    await execAsync(command, { env });
    
    // Read the output file
    const output = fs.readFileSync(outputFile, 'utf-8');
    const result = JSON.parse(output);
    
    // Clean up the temporary file
    fs.unlinkSync(outputFile);
    
    return {
      recommendation: result.recommendation,
      audioPath: result.audioPath || ''
    };
  } catch (error) {
    console.error('Error running Python script:', error);
    throw error;
  }
}

// Direct integration with the script1.py logic
async function generateDirectRecommendation(breed: string): Promise<string> {
  // This is a fallback if the Python script fails
  return `
# Breeding Recommendation for ${breed}

| Feature | Selected Breed | Recommended Crossbreed | Reason for Crossbreeding |
|---------|---------------|------------------------|--------------------------|
| Higher Milk Production | ${breed} | Sahiwal | Sahiwal is known for its high milk yield and when crossed with ${breed}, it can enhance milk production while maintaining the native breed's adaptability. |
| Better Heat & Disease Resistance | ${breed} | Gir | Gir cattle are highly resistant to tropical diseases and heat stress. Crossing with ${breed} will improve offspring's resilience. |
| Higher Butterfat Content | ${breed} | Red Sindhi | Red Sindhi cows produce milk with high fat content, ideal for dairy products. This trait can be passed to ${breed} crosses. |
  `;
}

export async function POST(req: Request) {
  try {
    const { breed } = await req.json();

    if (!breed || !VALID_BREEDS.includes(breed)) {
      return NextResponse.json(
        { error: 'Invalid breed selected' },
        { status: 400 }
      );
    }

    let recommendation;
    let audioUrl = '';

    try {
      // Try to use the Python script
      const scriptResult = await runPythonScript(breed);
      recommendation = scriptResult.recommendation;
      
      // If there's an audio file, read it and convert to base64
      if (scriptResult.audioPath && fs.existsSync(scriptResult.audioPath)) {
        const audioContent = fs.readFileSync(scriptResult.audioPath);
        audioUrl = `data:audio/mp3;base64,${audioContent.toString('base64')}`;
      }
    } catch (error) {
      console.warn('Python script execution failed, using fallback:', error);
      // Use the fallback method if Python script fails
      recommendation = await generateDirectRecommendation(breed);
    }
    
    return NextResponse.json({
      recommendation,
      audioUrl
    });
  } catch (error) {
    console.error('Error in cross-breeding recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
} 