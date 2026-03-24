"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function SOSButton() {
  return (
    <Link
      href="/emergency"
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-danger flex items-center justify-center sos-pulse shadow-danger hover:scale-110 transition-transform"
      aria-label="Emergency SOS"
      title="Emergency SOS"
    >
      <AlertTriangle className="w-7 h-7 text-white" />
    </Link>
  );
}
