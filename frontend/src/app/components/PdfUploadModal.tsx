"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

interface PdfUploadModalProps {
  open: boolean;
  onClose: () => void;
  onFile: (file: File) => Promise<void> | void;
}

export default function PdfUploadModal({ open, onClose, onFile }: PdfUploadModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setLoading(true);
    try {
      await onFile(acceptedFiles[0]);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: { "application/pdf": [] },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload PDF</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <div
          {...getRootProps()}
          className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 text-center hover:border-blue-400"
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-600">Drop the PDF here ...</p>
          ) : (
            <>
              <p className="text-gray-700">Drag & drop a PDF here, or click to select</p>
              <p className="mt-2 text-sm text-gray-500">Only .pdf files are accepted</p>
            </>
          )}
        </div>

        {loading && <p className="mt-4 text-sm text-gray-600">Processing…</p>}
      </div>
    </div>
  );
} 