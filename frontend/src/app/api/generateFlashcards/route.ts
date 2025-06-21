import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdf from "pdf-parse";

// we only run on the server (Edge runtimes are fine too)
export const runtime = "nodejs";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const data = await req.formData();
  const file = data.get("file") as File; // the PDF blob

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const text = (await pdf(buf)).text.slice(0, 15_000); // Gemini input limit

  // prompt Gemini
  const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite-preview-06-17" });
  const prompt = `Create concise flashcards in JSON like:
    [{"q":"...", "a":"..."}]  from the following text:\n\n${text}`;

  const res = await model.generateContent(prompt);
  const json = JSON.parse(res.response.text());

  return NextResponse.json({ flashcards: json });
}