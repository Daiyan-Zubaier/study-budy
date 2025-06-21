import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // Compose a prompt for quiz generation
  const prompt = `
Given the following study material, generate a set of quiz questions (with answers) that help a student review the content. Format each question and answer clearly.

STUDY MATERIAL:
${text}
`;

  // Call Gemini API
  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCKP1TWl_7Jg_XUpNy9ZdVVDkdf63oVBJo",
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