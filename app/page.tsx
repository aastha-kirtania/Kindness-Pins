"use client"

import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 via-indigo-200 to-pink-200 p-6">
      <h1 className="text-6xl md:text-7xl font-extrabold text-purple-800 mb-6 text-center drop-shadow-lg">
        Kindness Pins 🌟
      </h1>

      <p className="text-center max-w-xl text-purple-700 text-lg md:text-xl mb-8 leading-relaxed">
        Discover and leave <span className="font-semibold text-purple-900">anonymous messages of positivity</span> across the world!
        Spread kindness wherever you go.
      </p>

      <Link href="/map">
        <button className="bg-purple-700 text-white px-8 py-4 rounded-xl shadow-lg hover:bg-purple-800 hover:scale-105 transition-transform duration-200">
          Explore the Map
        </button>
      </Link>
    </div>
  )
}
