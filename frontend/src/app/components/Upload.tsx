"use client";
import React, { useRef } from "react";

export default function Upload({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleButtonClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={handleButtonClick}
        type="button"
      >
        Upload PDF or JPEG
      </button>
    </div>
  );
}