"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"

// Example button to open modal
export default function InstructionsModal() {
  const [isOpen, setIsOpen] = useState(true) // Open on first load

  return (
    <>
      {/* Overlay and Dialog */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <Dialog.Panel className="bg-white rounded-lg p-6 w-11/12 max-w-md text-gray-800">
          <Dialog.Title className="text-xl font-bold mb-4">
            How to Use Kindness Pins
          </Dialog.Title>
          <Dialog.Description className="space-y-2 text-sm">
            <ul className="list-disc ml-5">
              <li>Click anywhere on the map to leave a message (a "pin").</li>
              <li>Set a visibility radius for your pin (default 30 meters).</li>
              <li>Messages are only visible to users who enter that radius.</li>
              <li>Your location is tracked automatically and shown as "You are here".</li>
              <li>Notifications pop up when you enter someone else’s pin radius.</li>
              <li>You can delete your pins by clicking the pin and pressing the "Delete" button.</li>
            </ul>
          </Dialog.Description>

          <button
            onClick={() => setIsOpen(false)}
            className="mt-4 w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Got it!
          </button>
        </Dialog.Panel>
      </Dialog>

      {/* Optional trigger button if you want users to open it again */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 z-40"
      >
        Instructions
      </button>
    </>
  )
}
