"use client"

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Circle,
} from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)


// 📏 Distance Calculator (Haversine Formula)
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
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}


// 📍 Component for Adding Pins
function AddPin({ onAdd }: { onAdd: (pin: any) => void }) {
  useMapEvents({
    async click(e) {
      const message = prompt("Enter your message for this location:")
      if (!message) return

      const radiusStr = prompt(
        "Enter visibility radius in meters (optional, default 30m):"
      )
      const radius = radiusStr ? parseInt(radiusStr) : 30

      const { data, error } = await supabase
        .from("pins")
        .insert([
          {
            lat: e.latlng.lat,
            lng: e.latlng.lng,
            message,
            radius,
          },
        ])
        .select()

      if (error) {
        toast.error("Failed to add pin")
        console.error(error)
      } else {
        toast.success("Pin added!")
        onAdd(data[0])
      }
    },
  })

  return null
}


export default function Map({ pins }: { pins: any[] }) {
  const [localPins, setLocalPins] = useState(pins)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [notifiedPins, setNotifiedPins] = useState<string[]>([])

  // ➕ Add pin to local state
  const handleAddPin = (pin: any) => {
    setLocalPins((prev) => [...prev, pin])
  }

  // ❌ Delete pin
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("pins").delete().eq("id", id)

    if (error) {
      toast.error("Failed to delete pin")
      console.error(error)
    } else {
      setLocalPins((prev) => prev.filter((pin) => pin.id !== id))
      toast.success("Pin deleted")
    }
  }

  // 📡 Track user location
  useEffect(() => {
    navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([
          pos.coords.latitude,
          pos.coords.longitude,
        ])
      },
      (err) => {
        console.error("Location error:", err)
      },
      { enableHighAccuracy: true }
    )
  }, [])

  // 🔔 Check proximity & trigger notification
  useEffect(() => {
    if (!userLocation) return

    localPins.forEach((pin: any) => {
      const distance = getDistance(userLocation, [
        pin.lat,
        pin.lng,
      ])

      if (
        distance <= (pin.radius || 30) &&
        !notifiedPins.includes(pin.id)
      ) {
        toast.success(
          `💌 Someone left a message nearby:\n"${pin.message}"`
        )
        setNotifiedPins((prev) => [...prev, pin.id])
      }
    })
  }, [userLocation, localPins])

  return (
    <MapContainer
      center={[16.4632075, 80.5064032]}
      zoom={17}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <AddPin onAdd={handleAddPin} />

      {localPins.map((pin: any) => (
        <Marker
          key={pin.id}
          position={[pin.lat, pin.lng]}
        >
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

      {localPins.map((pin: any) => (
        <Circle
          key={`circle-${pin.id}`}
          center={[pin.lat, pin.lng]}
          radius={pin.radius || 30}
          pathOptions={{
            color: "purple",
            fillColor: "purple",
            fillOpacity: 0.1,
          }}
        />
      ))}
    </MapContainer>
  )
}
