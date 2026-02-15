"use client"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

// ------------------- Fix default marker icons -------------------
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

// ------------------- Supabase client -------------------
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ------------------- Types -------------------
interface Pin {
  id: string
  lat: number
  lng: number
  message: string
  radius?: number
}

// ------------------- Haversine formula -------------------
function getDistance(
  [lat1, lng1]: [number, number],
  [lat2, lng2]: [number, number]
) {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lng2 - lng1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ------------------- Auto-center map -------------------
function AutoCenter({ position }: { position: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView(position, map.getZoom(), { animate: true })
  }, [position, map])
  return null
}

// ------------------- AddPin Component -------------------
function AddPin({ onAdd }: { onAdd: (pin: Pin) => void }) {
  useMapEvents({
    async click(e) {
      const message = prompt("Enter your message for this location:")
      if (!message) return

      const radiusStr = prompt("Enter visibility radius in meters (default 30):")
      const radius = radiusStr ? parseInt(radiusStr) : 30

      const { data, error } = await supabase
        .from("pins")
        .insert([{ lat: e.latlng.lat, lng: e.latlng.lng, message, radius }])
        .select()

      if (error) {
        toast.error("Failed to add pin")
        console.error(error)
      } else {
        toast.success("Pin added!")
        onAdd(data[0] as Pin)
      }
    },
  })
  return null
}

// ------------------- Main Map Component -------------------
export default function Map({ pins }: { pins: Pin[] }) {
  const [localPins, setLocalPins] = useState<Pin[]>(pins)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [notifiedPins, setNotifiedPins] = useState<string[]>([])

  // ------------------- Real-time Supabase subscription -------------------
  useEffect(() => {
    const channel = supabase
      .channel("pins-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pins" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLocalPins((prev) => {
              if (prev.find((p) => p.id === payload.new.id)) return prev
              return [...prev, payload.new as Pin]
            })
          }
          if (payload.eventType === "DELETE") {
            setLocalPins((prev) =>
              prev.filter((pin) => pin.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // ------------------- Track user location -------------------
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.error("Location error:", err),
      { enableHighAccuracy: true }
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  // ------------------- Notify user when entering a pin radius -------------------
  useEffect(() => {
    if (!userLocation) return
    localPins.forEach((pin) => {
      const distance = getDistance(userLocation, [pin.lat, pin.lng])
      if (distance <= (pin.radius || 30) && !notifiedPins.includes(pin.id)) {
        toast.success(`💌 Nearby message: "${pin.message}"`)
        setNotifiedPins((prev) => [...prev, pin.id])
      }
    })
  }, [userLocation, localPins, notifiedPins])

  // ------------------- Add/Delete pins -------------------
  const handleAddPin = (pin: Pin) => setLocalPins((prev) => [...prev, pin])
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pins").delete().eq("id", id)
    if (error) toast.error("Failed to delete pin")
    else {
      setLocalPins((prev) => prev.filter((pin) => pin.id !== id))
      toast.success("Pin deleted")
    }
  }

  // ------------------- Visible pins -------------------
  const visiblePins = localPins.filter((pin) =>
    userLocation ? getDistance(userLocation, [pin.lat, pin.lng]) <= (pin.radius || 30) : true
  )

  return (
    <MapContainer
      center={userLocation || [16.4632075, 80.5064032]}
      zoom={17}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AddPin onAdd={handleAddPin} />
      <AutoCenter position={userLocation} />

      {/* User location */}
      {userLocation && (
        <Marker position={userLocation}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Pins */}
      {visiblePins.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]}>
          <Popup>
            <p>{pin.message}</p>
            <button
              onClick={() => handleDelete(pin.id)}
              className="mt-2 text-red-600 text-sm"
            >
              Delete
            </button>
          </Popup>
        </Marker>
      ))}

      {/* Pin radius circles */}
      {visiblePins.map((pin) => (
        <Circle
          key={`circle-${pin.id}`}
          center={[pin.lat, pin.lng]}
          radius={pin.radius || 30}
          pathOptions={{ color: "purple", fillColor: "purple", fillOpacity: 0.1 }}
        />
      ))}
    </MapContainer>
  )
}
