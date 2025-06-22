import Link from "next/link";

export default function Page() {
  return (
    <div className="flex h-full items-center justify-center p-4 text-gray-100">
      <Link href="/session">
        <button className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
          Start session
        </button>
      </Link>
    </div>
  );
}