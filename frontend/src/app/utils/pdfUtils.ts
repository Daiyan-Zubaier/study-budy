import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Set the workerSrc property using the CDN (no import needed)
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.mjs`;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(" ") + "\n";
  }

  return text;
}