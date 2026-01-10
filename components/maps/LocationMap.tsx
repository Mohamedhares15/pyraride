"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface LocationMapProps {
  stableLat: number;
  stableLng: number;
  stableName: string;
  stableAddress?: string;
}

export default function LocationMap({
  stableLat,
  stableLng,
  stableName,
  stableAddress,
}: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);

    // Dynamically import Leaflet on client side only
    import("leaflet").then((L) => {
      // Fix default marker icon issue
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Create custom red icon
      const icon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
        iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      setCustomIcon(icon);

      // Import CSS
      require("leaflet/dist/leaflet.css");
    });
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Stable Location</h3>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[400px] w-full relative">
          <style jsx global>{`
            .leaflet-container {
              height: 100%;
              width: 100%;
              z-index: 0;
              font-family: inherit;
            }
            .leaflet-popup-content {
              margin: 8px 12px;
            }
            .leaflet-popup-content-wrapper {
              border-radius: 8px;
            }
          `}</style>
          <MapContainer
            center={[stableLat, stableLng]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Stable Marker (Red) */}
            {customIcon && (
              <Marker position={[stableLat, stableLng]} icon={customIcon}>
                <Popup>
                  <div>
                    <strong>{stableName}</strong>
                    <br />
                    {stableAddress || stableName}
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </Card>

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          📍 <strong>Meeting Point:</strong> {stableAddress || stableName}
        </p>
      </div>
    </div>
  );
}
