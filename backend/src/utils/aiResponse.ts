import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});


export async function getAiChatResponse(prompt: string): Promise<string | null> {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  if(!response.text) return null;
  return response.text;
//   return getJsonFromAIResponse(response.text);
}


export async function getAiSummaryResponse(prompt: string): Promise<JSON | null> {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  if(!response.text) return null;
  return getJsonFromAIResponse(response.text);
}


function getJsonFromAIResponse(text: string): JSON {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    const jsonText = text.slice(start, end);

    return JSON.parse(jsonText);
}