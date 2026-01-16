
import { GoogleGenAI, Type } from "@google/genai";
import { GrammarResponse, AIModel } from "../types";

/**
 * Checks Tamil grammar and spelling using selected Gemini model.
 */
export async function checkTamilGrammar(text: string, model: AIModel = 'gemini-3-flash-preview'): Promise<GrammarResponse> {
  if (!text.trim()) return { correctedText: text, suggestions: [] };

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `Act as a professional Tamil language expert. Analyze the following text for grammar (Ilakkanam), spelling, and word junction (Sandhi/Punarchi) errors. Provide specific suggestions for corrections and the linguistic reason for each change.\n\nText: ${text}`;
    
    const response = await ai.models.generateContent({
      model: model,
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

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Gemini AI");
    
    const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson) as GrammarResponse;

    // Attach positions for highlighting
    parsed.suggestions = parsed.suggestions.map(s => {
      const index = text.indexOf(s.original);
      return {
        ...s,
        index: index !== -1 ? index : undefined,
        length: s.original.length
      };
    });

    return parsed;
  } catch (error: any) {
    console.error("Gemini API Error details:", error);
    
    if (error.message?.includes("API_KEY") || error.message?.includes("key")) {
      throw new Error("API Key missing or invalid. Please check your environment variables.");
    }
    
    throw new Error("Failed to connect to Gemini AI. " + error.message);
  }
}
