export async function getAiChatResponse(prompt: string): Promise<any | null> {
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
      ]
    })
  });

  // Await and parse the JSON content of the response
  if (!response.ok) return null;
  try {
    const jsonResponse = await response.json();
    return jsonResponse;
  } catch (e) {
    console.error("Failed to parse AI response as JSON:", e);
    return null;
  }
}


function getJsonFromAIResponse(text: string): JSON | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}') + 1;
  const jsonText = text.slice(start, end);

  return JSON.parse(jsonText);
}
