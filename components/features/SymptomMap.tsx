"use client";

import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

type Clinic = { name: string; lat: number; lng: number; distance: string; };

export default function SymptomMap({ clinics, awayText = "away" }: { clinics: Clinic[], awayText?: string }) {
  return (
    <MapContainer center={[12.9716, 77.5946] as any} zoom={12} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Circle center={[12.9716, 77.5946] as any} radius={2500} pathOptions={{ color: "#0EA5A4" } as any} />
      {clinics.map((clinic) => (
        <Marker key={clinic.name} position={[clinic.lat, clinic.lng] as any} icon={markerIcon}>
          <Popup>
            <strong>{clinic.name}</strong>
            <br />
            {clinic.distance} {awayText}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
