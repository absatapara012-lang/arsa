import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeNutrition(nutritionData: any[]) {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this nutrition data and provide a brief summary of the member's progress and areas for improvement: ${JSON.stringify(nutritionData)}`,
    config: {
      systemInstruction: "You are an expert dietician for a high-end gym. Provide concise, professional advice.",
    },
  });
  const response = await model;
  return response.text;
}

export async function generateDietPlan(memberGoal: string) {
  const model = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a 7-day high-protein diet plan for a member with the following goal: ${memberGoal}`,
    config: {
      systemInstruction: "You are an expert dietician. Provide a detailed, structured diet plan in Markdown format.",
    },
  });
  const response = await model;
  return response.text;
}
