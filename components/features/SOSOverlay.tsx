"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock3,
  Loader2,
  MapPin,
  Phone,
  Radio,
  ShieldCheck,
  Siren,
  Truck,
  X,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import EmergencyTimeline, {
  type TimelineStatus,
} from "@/components/features/EmergencyTimeline";
import { useLanguage } from "@/lib/i18n/context";
import { t, type TranslationKey } from "@/lib/i18n/translations";

const AmbulanceMap = dynamic(() => import("@/components/features/AmbulanceMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[350px] w-full items-center justify-center rounded-2xl bg-glass-white">
      <div className="h-10 w-10 rounded-full border-2 border-accent-lighter border-t-transparent animate-spin" />
    </div>
  ),
});

interface Coords {
  lat: number;
  lng: number;
}

type LocationSource = "live" | "fallback";

interface AmbulanceUnit {
  id: string;
  name: string;
  vehicleNumber: string;
  driver: string;
  phone: string;
  startLocation: Coords;
}

const AMBULANCE_FLEET: AmbulanceUnit[] = [
  {
    id: "AMB-001",
    name: "Apollo Emergency Unit",
    vehicleNumber: "TS 09 AB 1234",
    driver: "Ramesh Kumar",
    phone: "+91 98765 43210",
    startLocation: { lat: 17.395, lng: 78.489 },
  },
  {
    id: "AMB-002",
    name: "KIMS Rapid Response",
    vehicleNumber: "TS 07 CD 5678",
    driver: "Suresh Reddy",
    phone: "+91 87654 32109",
    startLocation: { lat: 17.405, lng: 78.495 },
  },
  {
    id: "AMB-003",
    name: "Gandhi Hospital Unit",
    vehicleNumber: "TS 10 EF 9012",
    driver: "Venkat Rao",
    phone: "+91 76543 21098",
    startLocation: { lat: 17.378, lng: 78.481 },
  },
];

const FALLBACK_COORDS: Coords = { lat: 17.385, lng: 78.4867 };

const LIVE_UPDATE_PLAN: Array<{ delay: number; key: TranslationKey }> = [
  { delay: 900, key: "emergencyUpdateLocationShared" },
  { delay: 1700, key: "emergencyUpdateAmbulanceAssigned" },
  { delay: 2500, key: "emergencyUpdateContactsAlerted" },
  { delay: 4200, key: "emergencyUpdateTrafficPolice" },
  { delay: 6200, key: "emergencyUpdateRouteCleared" },
];

function haversine(a: Coords, b: Coords) {
  const radius = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  return radius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function calculateEta(distance: number) {
  if (distance <= 0.12) {
    return 0;
  }

  return Math.max(1, Math.round(distance * 3.4));
}

function getNearestAmbulance(userLocation: Coords) {
  let nearest = AMBULANCE_FLEET[0];
  let shortestDistance = haversine(userLocation, nearest.startLocation);

  for (const ambulance of AMBULANCE_FLEET) {
    const currentDistance = haversine(userLocation, ambulance.startLocation);
    if (currentDistance < shortestDistance) {
      shortestDistance = currentDistance;
      nearest = ambulance;
    }
  }

  return nearest;
}

function buildRoutePath(start: Coords, end: Coords, segments = 18) {
  return Array.from({ length: segments + 1 }, (_, index) => {
    const progress = index / segments;
    const curve = Math.sin(progress * Math.PI) * 0.0024;

    return {
      lat: start.lat + (end.lat - start.lat) * progress + curve,
      lng: start.lng + (end.lng - start.lng) * progress - curve * 0.65,
    };
  });
}

function detectUserLocation(): Promise<{ coords: Coords; source: LocationSource }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ coords: FALLBACK_COORDS, source: "fallback" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          source: "live",
        });
      },
      () => resolve({ coords: FALLBACK_COORDS, source: "fallback" }),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
}

interface SOSOverlayProps {
  onClose: () => void;
}

export default function SOSOverlay({ onClose }: SOSOverlayProps) {
  const { lang } = useLanguage();
  const [userLocation, setUserLocation] = useState<Coords | null>(null);
  const [ambulance, setAmbulance] = useState<AmbulanceUnit | null>(null);
  const [ambulancePosition, setAmbulancePosition] = useState<Coords | null>(null);
  const [status, setStatus] = useState<TimelineStatus>("detecting");
  const [distance, setDistance] = useState(0);
  const [eta, setEta] = useState(0);
  const [locationSource, setLocationSource] = useState<LocationSource | null>(null);
  const [updates, setUpdates] = useState<TranslationKey[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const timeoutsRef = useRef<number[]>([]);
  const movementRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setElapsed((current) => current + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function startFlow() {
      const location = await detectUserLocation();
      if (cancelled) {
        return;
      }

      setUserLocation(location.coords);
      setLocationSource(location.source);

      const assignedAmbulance = getNearestAmbulance(location.coords);
      const initialDistance = haversine(
        assignedAmbulance.startLocation,
        location.coords
      );
      const route = buildRoutePath(
        assignedAmbulance.startLocation,
        location.coords,
        Math.max(16, Math.round(initialDistance * 10))
      );

      setAmbulance(assignedAmbulance);
      setAmbulancePosition(assignedAmbulance.startLocation);
      setDistance(initialDistance);
      setEta(calculateEta(initialDistance));
      setStatus("assigned");

      LIVE_UPDATE_PLAN.forEach(({ delay, key }) => {
        timeoutsRef.current.push(
          window.setTimeout(() => {
            setUpdates((current) =>
              current.includes(key) ? current : [...current, key]
            );
          }, delay)
        );
      });

      timeoutsRef.current.push(
        window.setTimeout(() => {
          setStatus("notified");
        }, 1200)
      );

      timeoutsRef.current.push(
        window.setTimeout(() => {
          setStatus("en_route");

          let routeIndex = 0;
          movementRef.current = window.setInterval(() => {
            routeIndex += 1;
            const nextPoint = route[routeIndex];

            if (!nextPoint) {
              if (movementRef.current) {
                window.clearInterval(movementRef.current);
                movementRef.current = null;
              }
              return;
            }

            setAmbulancePosition(nextPoint);
            const remainingDistance = haversine(nextPoint, location.coords);
            setDistance(remainingDistance);
            setEta(calculateEta(remainingDistance));

            if (routeIndex >= route.length - 3) {
              setStatus("arriving");
            }

            if (routeIndex >= route.length - 1) {
              setDistance(0);
              setEta(0);
              setStatus("arriving");

              if (movementRef.current) {
                window.clearInterval(movementRef.current);
                movementRef.current = null;
              }
            }
          }, 900);
        }, 2400)
      );
    }

    void startFlow();

    return () => {
      cancelled = true;
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];

      if (movementRef.current) {
        window.clearInterval(movementRef.current);
        movementRef.current = null;
      }
    };
  }, []);

  const coordinationItems = useMemo(
    () => [
      {
        key: "emergencyCoordinationContacts",
        active: status === "notified" || status === "en_route" || status === "arriving",
      },
      {
        key: "emergencyCoordinationTraffic",
        active: status === "en_route" || status === "arriving",
      },
      {
        key: "emergencyCoordinationRoute",
        active:
          status === "arriving" || updates.includes("emergencyUpdateRouteCleared"),
      },
    ] as const,
    [status, updates]
  );

  const elapsedLabel = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(
    elapsed % 60
  ).padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-y-auto bg-navy-950/95 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-danger sos-pulse">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                {t("emergencyOverlayTitle", lang)}
              </h2>
              <p className="text-sm text-white/60">
                {locationSource
                  ? t(
                      locationSource === "live"
                        ? "emergencyLocationLive"
                        : "emergencyLocationFallback",
                      lang
                    )
                  : t("emergencyOverlayLocating", lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-glass-border bg-white/5 px-4 py-2 text-sm text-white/70 sm:flex sm:items-center sm:gap-2">
              <Clock3 className="h-4 w-4 text-accent-lighter" />
              <span>{elapsedLabel}</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-glass-border bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
              aria-label={t("emergencyClose", lang)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <GlassCard noHover>
            <div className="mb-2 flex items-center gap-2 text-danger-light">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                {t("emergencyOverlayEta", lang)}
              </span>
            </div>
            <div className="text-3xl font-semibold text-white">
              {eta}
              <span className="ml-1 text-base font-medium text-white/60">
                {t("emergencyMinutes", lang)}
              </span>
            </div>
          </GlassCard>

          <GlassCard noHover>
            <div className="mb-2 flex items-center gap-2 text-accent-lighter">
              <MapPin className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                {t("emergencyOverlayDistance", lang)}
              </span>
            </div>
            <div className="text-3xl font-semibold text-white">
              {distance.toFixed(1)}
              <span className="ml-1 text-base font-medium text-white/60">
                {t("emergencyKilometers", lang)}
              </span>
            </div>
          </GlassCard>

          <GlassCard noHover>
            <div className="mb-2 flex items-center gap-2 text-success-light">
              <Radio className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                {t("emergencyOverlayStatus", lang)}
              </span>
            </div>
            <div className="text-lg font-semibold text-white">
              {t(
                status === "detecting"
                  ? "emergencyTimelineDetecting"
                  : status === "assigned"
                  ? "emergencyTimelineAssigned"
                  : status === "notified"
                  ? "emergencyTimelineNotified"
                  : status === "en_route"
                  ? "emergencyTimelineEnRoute"
                  : "emergencyTimelineArriving",
                lang
              )}
            </div>
          </GlassCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.95fr)]">
          <div className="space-y-6">
            <GlassCard noHover className="!p-0 overflow-hidden">
              {userLocation && ambulancePosition ? (
                <AmbulanceMap
                  userLocation={userLocation}
                  ambulanceLocation={ambulancePosition}
                  eta={eta}
                  distance={distance}
                />
              ) : (
                <div className="flex h-[350px] items-center justify-center rounded-2xl">
                  <div className="flex items-center gap-3 text-white/70">
                    <Loader2 className="h-5 w-5 animate-spin text-accent-lighter" />
                    <span>{t("emergencyOverlayLocating", lang)}</span>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard noHover>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success-light" />
                <h3 className="font-semibold text-white">
                  {t("emergencyCoordinationTitle", lang)}
                </h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {coordinationItems.map((item) => (
                  <div
                    key={item.key}
                    className={`rounded-2xl border px-4 py-3 text-sm transition-colors ${
                      item.active
                        ? "border-success/40 bg-success/10 text-success-light"
                        : "border-glass-border bg-white/5 text-white/45"
                    }`}
                  >
                    {t(item.key, lang)}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-6">
            <GlassCard noHover>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/15">
                  <Truck className="h-6 w-6 text-danger-light" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">
                    {ambulance?.name ?? t("emergencyOverlaySearching", lang)}
                  </h3>
                  <p className="text-sm text-white/60">
                    {ambulance?.vehicleNumber ?? t("emergencyOverlayLocating", lang)}
                  </p>
                </div>
              </div>

              {ambulance ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-glass-border bg-white/5 p-4">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      {t("emergencyOverlayDriver", lang)}
                    </div>
                    <div className="text-base font-medium text-white">
                      {ambulance.driver}
                    </div>
                  </div>

                  <a
                    href={`tel:${ambulance.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-success/15 px-4 py-2 text-sm font-medium text-success-light no-underline transition-colors hover:bg-success/25"
                  >
                    <Phone className="h-4 w-4" />
                    {t("emergencyOverlayCallDriver", lang)}
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-white/70">
                  <Loader2 className="h-4 w-4 animate-spin text-accent-lighter" />
                  <span>{t("emergencyOverlayLocating", lang)}</span>
                </div>
              )}
            </GlassCard>

            <GlassCard noHover>
              <div className="mb-4 flex items-center gap-2">
                <Siren className="h-4 w-4 text-accent-lighter" />
                <h3 className="font-semibold text-white">
                  {t("emergencyTimelineTitle", lang)}
                </h3>
              </div>
              <EmergencyTimeline currentStatus={status} />
            </GlassCard>

            <GlassCard noHover>
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-success-light" />
                <h3 className="font-semibold text-white">
                  {t("emergencyLiveUpdatesTitle", lang)}
                </h3>
              </div>

              <div className="space-y-3">
                {updates.map((updateKey) => (
                  <motion.div
                    key={updateKey}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 text-sm text-white/75"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-success-light" />
                    <span>{t(updateKey, lang)}</span>
                  </motion.div>
                ))}

                {!updates.length && (
                  <div className="flex items-center gap-3 text-sm text-white/60">
                    <Loader2 className="h-4 w-4 animate-spin text-accent-lighter" />
                    <span>{t("emergencyOverlaySearching", lang)}</span>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-full border border-glass-border bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            {t("emergencyClose", lang)}
          </button>
          <a
            href="tel:108"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-danger px-6 py-3 text-sm font-semibold text-white no-underline shadow-danger transition-transform hover:scale-[1.02]"
          >
            <Phone className="h-4 w-4" />
            {t("emergencyOverlayCallAmbulance", lang)}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
