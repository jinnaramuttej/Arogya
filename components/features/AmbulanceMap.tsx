"use client";

import { useEffect, useRef, memo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

interface Coords {
  lat: number;
  lng: number;
}

interface AmbulanceMapProps {
  userLocation: Coords | null;
  ambulanceLocation: Coords | null;
  eta: number;
  distance: number;
}

function getThemeColor(variable: string) {
  if (typeof window === "undefined") return "#000";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
}

const AmbulanceMap = memo(function AmbulanceMap({
  userLocation,
  ambulanceLocation,
  eta,
  distance,
}: AmbulanceMapProps) {
  const { lang } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const ambulanceMarkerRef = useRef<L.CircleMarker | null>(null);
  const routeRef = useRef<L.Polyline | null>(null);

  // Initialize map ONLY ONCE (when it first gets userLocation and ambulanceLocation)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !userLocation || !ambulanceLocation) {
      return;
    }

    const accentColor = getThemeColor("--color-accent");
    const accentLightColor = getThemeColor("--color-accent-light");
    const dangerColor = getThemeColor("--color-danger");
    const dangerLightColor = getThemeColor("--color-danger-light");

    const map = L.map(mapRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);

    L.circleMarker([userLocation.lat, userLocation.lng], {
      radius: 10,
      color: accentLightColor,
      fillColor: accentColor,
      fillOpacity: 1,
      weight: 3,
    })
      .addTo(map)
      .bindPopup(t("emergencyMapUserLocation", lang));

    const ambulanceMarker = L.circleMarker(
      [ambulanceLocation.lat, ambulanceLocation.lng],
      {
        radius: 12,
        color: dangerLightColor,
        fillColor: dangerColor,
        fillOpacity: 1,
        weight: 3,
      }
    )
      .addTo(map)
      .bindPopup(
        `${t("emergencyMapAmbulanceUnit", lang)}\n${t("emergencyOverlayEta", lang)}: ${eta} min\n${t("emergencyOverlayDistance", lang)}: ${distance.toFixed(1)} km`
      );

    const route = L.polyline(
      [
        [ambulanceLocation.lat, ambulanceLocation.lng],
        [userLocation.lat, userLocation.lng],
      ],
      {
        color: dangerColor,
        weight: 4,
        opacity: 0.85,
        dashArray: "10 8",
      }
    ).addTo(map);

    map.fitBounds(route.getBounds(), { padding: [48, 48] });

    mapInstanceRef.current = map;
    ambulanceMarkerRef.current = ambulanceMarker;
    routeRef.current = route;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      ambulanceMarkerRef.current = null;
      routeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run ONLY once when we first have locations

  // Update markers on state change WITHOUT remounting map
  useEffect(() => {
    if (
      !ambulanceMarkerRef.current ||
      !routeRef.current ||
      !userLocation ||
      !ambulanceLocation
    ) {
      return;
    }

    ambulanceMarkerRef.current.setLatLng([
      ambulanceLocation.lat,
      ambulanceLocation.lng,
    ]);

    ambulanceMarkerRef.current.setPopupContent(
      `${t("emergencyMapAmbulanceUnit", lang)}\n${t("emergencyOverlayEta", lang)}: ${eta} min\n${t("emergencyOverlayDistance", lang)}: ${distance.toFixed(1)} km`
    );

    routeRef.current.setLatLngs([
      [ambulanceLocation.lat, ambulanceLocation.lng],
      [userLocation.lat, userLocation.lng],
    ]);
  }, [ambulanceLocation, distance, eta, lang, userLocation]);

  return <div ref={mapRef} className="h-[350px] min-h-[350px] w-full rounded-2xl z-0 relative isolate" />;
});

export default AmbulanceMap;
