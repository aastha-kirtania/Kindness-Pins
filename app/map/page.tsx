"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

const Map = dynamic(() => import("../../components/Map"), { ssr: false })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function MapPage() {
  const [pins, setPins] = useState<any[]>([])

  useEffect(() => {
    async function fetchPins() {
      const { data } = await supabase.from("pins").select("*")
      setPins(data || [])
    }

    fetchPins()
  }, [])

  return <Map pins={pins} />
}
