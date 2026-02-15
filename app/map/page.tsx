"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const Map = dynamic(() => import("../../components/Map"), { ssr: false })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Pin {
  id: string
  lat: number
  lng: number
  message: string
  radius?: number
}

export default function MapPage() {
  const [pins, setPins] = useState<Pin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPins() {
      const { data, error } = await supabase.from("pins").select("*")
      if (error) {
        console.error("Failed to fetch pins:", error)
        setLoading(false)
        return
      }
      setPins(data || [])
      setLoading(false)
    }

    fetchPins()
  }, [])

  if (loading) return <p>Loading map...</p>

  return <Map pins={pins} />
}
