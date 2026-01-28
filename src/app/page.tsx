import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-8">
      <main className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-5xl font-bold tracking-tighter">
          Agent Council Forensic App
        </h1>
        <p className="text-xl text-gray-400 max-w-md">
          Advanced forensic analysis for the digital age.
        </p>

        <div className="flex gap-4 mt-8">
          <Link
            href="/evidence"
            className="rounded-full border border-gray-700 bg-gray-900 px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Evidence Chamber
          </Link>
          <Link
            href="/result"
            className="rounded-full border border-gray-700 bg-gray-900 px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Result Screen
          </Link>
        </div>
      </main>
    </div>
  );
}
