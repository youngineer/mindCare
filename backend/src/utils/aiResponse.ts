import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});


export async function getAiResponse(prompt: string): Promise<string | null> {
    const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt,
  });

  if(!response.text) return null;
  console.log(response.text);
  return response.text;
//   return getJsonFromAIResponse(response.text);
}


function getJsonFromAIResponse(text: string): JSON {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}') + 1;
    const jsonText = text.slice(start, end);

    return JSON.parse(jsonText);
}