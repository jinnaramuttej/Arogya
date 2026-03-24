"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const ambulanceIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "text-primary"
});

export default function AmbulanceSOSMap({ location }: { location: { lat: number; lng: number; address: string } | null }) {
  return (
    <MapContainer
      center={location ? [location.lat, location.lng] : [12.9716, 77.5946]}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {location && (
        <>
          <Marker position={[location.lat, location.lng]} icon={markerIcon}>
            <Popup>Incident location</Popup>
          </Marker>
          <Marker position={[location.lat + 0.02, location.lng - 0.02]} icon={ambulanceIcon}>
            <Popup>Ambulance Unit #402</Popup>
          </Marker>
          <Polyline
            positions={[
              [location.lat + 0.02, location.lng - 0.02],
              [location.lat, location.lng]
            ]}
            pathOptions={{ color: "#0EA5A4" }}
          />
        </>
      )}
    </MapContainer>
  );
}
