import { Request, Response } from "express";
import { getDescriptionFromDeepAI } from "../services/ai.service"

export const generateDescription = async (req: Request, res: Response) => {
  const { topic } = req.body;
  console.log("Received topic:", topic);

  if (!topic) {
    throw new Error("Topic is required.");
  }

  try {
    const description = await getDescriptionFromDeepAI(topic);
    res.json({ topic, description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get description from OpenAI." });
  }
};
