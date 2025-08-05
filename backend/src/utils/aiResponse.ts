export async function getAiChatResponse(prompt: string): Promise<string | null> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "google/gemma-3n-e4b-it:free",
      messages: [
      {
        "role": "user",
        "content": prompt
      }
    ],
    })
  });

  // Await the text content of the response
  const text = await response.text();
  const botResponse = getJsonFromAIResponse(text);
  console.log(botResponse)
  return botResponse || null;
}

// export async function getAiSummaryResponse(prompt: string): Promise<any | null> {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-pro",
//     contents: prompt,
//   });

//   if (!response.text) return null;
//   try {
//     return getJsonFromAIResponse(response.text);
//   } catch (e) {
//     console.error("Failed to parse AI response as JSON:", e);
//     return null;
//   }
// }

function getJsonFromAIResponse(text: string): string | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  const jsonText = text.slice(start, end);

  const jsonData = JSON.parse(jsonText);
  return jsonData?.choices[0]?.message?.content || null;
}
