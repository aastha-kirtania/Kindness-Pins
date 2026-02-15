"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-200 to-indigo-200 p-4">
      <h1 className="text-5xl font-bold text-purple-800 mb-6 text-center">
        Kindness Pins 🌟
      </h1>

      <p className="text-center max-w-lg text-purple-700 mb-8">
        Discover and leave anonymous messages of positivity across the world!
        Spread kindness wherever you go.
      </p>

      <Link href="/map">
        <button className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition">
          Explore the Map
        </button>
      </Link>
    </div>
  )
}
