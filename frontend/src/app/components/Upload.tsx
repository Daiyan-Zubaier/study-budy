"use client";
import React, { useRef, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function Upload({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [], "image/jpeg": [] },
    multiple: false,
    onDrop: (accepted) => {
      if (accepted.length) {
        const file = accepted[0];
        setSelected(file);
        onFile(file);
      }
    },
  });

  function handleButtonClick() {
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  }

  const zoneClass = `flex h-48 w-80 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center transition-colors ${
    isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
  }`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Click-to-browse fallback (hidden) */}
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Drag-and-drop rectangle */}
      <div {...getRootProps()} className={zoneClass}>
        <input {...getInputProps()} />
        {selected ? (
          <p className="text-green-700">✓ {selected.name} selected</p>
        ) : isDragActive ? (
          <p className="text-blue-600">Drop the file here…</p>
        ) : (
          <>
            <p className="text-gray-700">Drag & drop a PDF or JPEG here</p>
            <p className="mt-2 text-sm text-gray-500">or click to browse files</p>
          </>
        )}
      </div>

      {/* Button fallback for accessibility */}
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        onClick={handleButtonClick}
        type="button"
      >
        {selected ? "Change File" : "Browse Files"}
      </button>
    </div>
  );
}