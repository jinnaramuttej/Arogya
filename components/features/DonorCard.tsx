"use client";

import { Droplet, Phone, MapPin } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useLanguage } from "@/lib/i18n/context";
import { t } from "@/lib/i18n/translations";

interface Donor {
  id: string;
  name: string;
  blood_group: string;
  phone: string;
  lat: number | null;
  lng: number | null;
}

interface DonorCardProps {
  donor: Donor;
  userLat?: number;
  userLng?: number;
}

function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type { Donor };

export default function DonorCard({ donor, userLat, userLng }: DonorCardProps) {
  const { lang } = useLanguage();

  const distance =
    userLat && userLng && donor.lat && donor.lng
      ? calcDistance(userLat, userLng, donor.lat, donor.lng).toFixed(1)
      : null;

  return (
    <GlassCard noHover>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
            <Droplet className="w-5 h-5 text-danger-light" />
          </div>
          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">{donor.name}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger-light text-xs font-semibold">
                {donor.blood_group}
              </span>
              {distance && (
                <span className="flex items-center gap-1 text-white/50 text-xs">
                  <MapPin className="w-3 h-3" />
                  {distance} {t("donorDistance", lang)}
                </span>
              )}
            </div>
          </div>
        </div>
        <a
          href={`tel:${donor.phone}`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-accent-light to-accent text-white text-xs font-semibold shrink-0 no-underline transition-all hover:shadow-accent-hover"
        >
          <Phone className="w-3.5 h-3.5" />
          {t("contactDonor", lang)}
        </a>
      </div>
    </GlassCard>
  );
}
