import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeStock(items: any[], transactions: any[]) {
  const prompt = `
    Analyze the following warehouse stock data and transaction history.
    Provide a concise analysis for each item that is low on stock or has high usage.
    
    Items: ${JSON.stringify(items)}
    Recent Transactions: ${JSON.stringify(transactions)}
    
    Format the response as a JSON array of objects:
    [{ "itemName": "Item Name", "avgUsage": "30 per day", "prediction": "3 days", "recommendation": "Order 200 units" }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return [];
  }
}
