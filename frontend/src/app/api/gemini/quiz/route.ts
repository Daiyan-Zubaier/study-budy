import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // Compose a prompt for quiz generation
  const prompt = `
Given the following study material, generate a set of multiple-choice quiz questions to help a student review the content.
Return the quiz as a JSON array of objects, each with these keys:
- question: the question string
- options: an array of 4 answer choices (strings)
- answer: the correct answer string (must match one of the options exactly)

STUDY MATERIAL:
${text}
`;

  // Call Gemini API
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