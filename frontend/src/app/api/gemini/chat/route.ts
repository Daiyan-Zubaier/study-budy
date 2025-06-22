import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyB2-KM1JzPgpMeqM2jGs6Z2B5DtsouHZDE",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    }
  );

  const data = await response.json();
  console.log("🔍 Gemini API raw response:", JSON.stringify(data, null, 2));

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
  return NextResponse.json({ text });
}
