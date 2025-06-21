import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // Compose a prompt for flashcard generation
  const prompt = `
Given the following study material, generate a set of flashcards to help a student review the content. 
Each flashcard should have a question or term on one side and the answer or explanation on the other. 
Format the flashcards as a list, with each flashcard clearly separated.

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