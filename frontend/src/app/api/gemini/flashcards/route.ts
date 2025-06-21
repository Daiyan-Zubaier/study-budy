import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const prompt = `
Given the following study material, return flashcards in pure JSON format.

⚠️ DO NOT include any code blocks, triple backticks, markdown, explanation, or headings. ⚠️

Only return a JSON array like this:

[
  { "question": "What is the capital of France?", "answer": "Paris" },
  { "question": "What is 2 + 2?", "answer": "4" }
]

STUDY MATERIAL:
${text}
`;

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB2-KM1JzPgpMeqM2jGs6Z2B5DtsouHZDE",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
