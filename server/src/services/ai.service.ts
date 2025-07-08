import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const getDescriptionFromDeepAI = async (
  topic: string
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });

  const prompt = `Write a 200 words clear description about ${topic}.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return response.text().trim();
};
