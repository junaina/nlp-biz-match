// src/lib/groq.ts
import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  console.warn(
    "⚠️ GROQ_API_KEY is not set. LLM matching will fall back to naive scoring."
  );
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
