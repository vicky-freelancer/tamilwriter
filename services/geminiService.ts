
import { GoogleGenAI, Type } from "@google/genai";
import { GrammarResponse } from "../types";

/**
 * Checks Tamil grammar and spelling using the Gemini 3 Flash model.
 * Adheres to @google/genai best practices.
 */
export async function checkTamilGrammar(text: string): Promise<GrammarResponse> {
  if (!text.trim()) return { correctedText: text, suggestions: [] };

  try {
    // Create instance inside the function as recommended to ensure latest API key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: `Act as a professional Tamil language expert. Analyze the following text for grammar (Ilakkanam), spelling, and word junction (Sandhi/Punarchi) errors. Provide specific suggestions for corrections and the linguistic reason for each change.\n\nText: ${text}` }] }],
      config: {
        systemInstruction: "You are a professional Tamil language grammar assistant. You analyze text and provide structured JSON feedback with correctedText and a list of suggestions. Each suggestion must have a unique id, type (Spelling, Grammar, or Sandhi), original word/phrase, suggested correction, and the reason in Tamil.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedText: { type: Type.STRING },
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

    // Access text property directly (not a method)
    const resultJson = response.text;
    if (!resultJson) throw new Error("Empty response from AI");
    
    return JSON.parse(resultJson) as GrammarResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to connect to Gemini AI. Please check your network or try again.");
  }
}
