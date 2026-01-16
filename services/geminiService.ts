
import { GoogleGenAI, Type } from "@google/genai";
import { GrammarResponse } from "../types";

/**
 * Checks Tamil grammar and spelling using the Gemini 3 Flash model.
 * Adheres to @google/genai best practices and prompt instructions.
 */
export async function checkTamilGrammar(text: string): Promise<GrammarResponse> {
  if (!text.trim()) return { correctedText: text, suggestions: [] };

  try {
    // Create instance using process.env.API_KEY directly as required by instructions.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Act as a professional Tamil language expert. Analyze the following text for grammar (Ilakkanam), spelling, and word junction (Sandhi/Punarchi) errors. Provide specific suggestions for corrections and the linguistic reason for each change.\n\nText: ${text}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are a professional Tamil language grammar assistant. You analyze text and provide structured JSON feedback with correctedText and a list of suggestions. Each suggestion must have a unique id, type (Spelling, Grammar, or Sandhi), original word/phrase, suggested correction, and the reason in Tamil. Return ONLY the JSON object.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedText: { 
              type: Type.STRING,
              description: "The full corrected version of the input text."
            },
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  original: { type: Type.STRING },
                  suggestion: { type: Type.STRING },
                  reason: { type: Type.STRING }
                },
                required: ["id", "type", "original", "suggestion", "reason"]
              }
            }
          },
          required: ["correctedText", "suggestions"]
        },
        temperature: 0.1,
      },
    });

    // Directly access the .text property
    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini AI");
    
    // Clean up potential markdown formatting just in case the model returns it
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as GrammarResponse;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    // Provide a helpful error message if the API key is missing or invalid
    if (error.message?.includes("Requested entity was not found") || error.message?.includes("API_KEY")) {
      throw new Error("Gemini AI configuration error. Please ensure the API_KEY environment variable is correctly set in your Vercel project settings.");
    }
    
    throw new Error("Failed to connect to Gemini AI. Please check your network connection or API configuration.");
  }
}
