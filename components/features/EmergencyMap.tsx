"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function EmergencyMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [17.385, 78.4867], // Hyderabad
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    // Try to get user location
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 14);

        L.marker([latitude, longitude])
          .addTo(map)
          .bindPopup("You are here")
          .openPopup();

        // Add some mock hospital markers nearby
        const hospitals = [
          { name: "City General Hospital", lat: latitude + 0.01, lng: longitude + 0.008 },
          { name: "Apollo Emergency", lat: latitude - 0.008, lng: longitude + 0.012 },
          { name: "KIMS Hospital", lat: latitude + 0.005, lng: longitude - 0.01 },
        ];

        hospitals.forEach((h) => {
          L.marker([h.lat, h.lng])
            .addTo(map)
            .bindPopup(`<b>${h.name}</b><br/>Emergency Room Available`);
        });
      },
      () => {
        // Fallback: show Hyderabad with mock hospitals
        const hospitals = [
          { name: "Gandhi Hospital", lat: 17.395, lng: 78.489 },
          { name: "Osmania General Hospital", lat: 17.378, lng: 78.481 },
          { name: "Nizam's Institute", lat: 17.402, lng: 78.495 },
        ];
        hospitals.forEach((h) => {
          L.marker([h.lat, h.lng])
            .addTo(map)
            .bindPopup(`<b>${h.name}</b><br/>Emergency Room Available`);
        });
      }
    );

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-2xl"
      style={{ minHeight: 400 }}
    />
  );
}
