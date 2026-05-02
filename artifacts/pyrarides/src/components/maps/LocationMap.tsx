"use client";

import { useEffect, useState, lazy, Suspense } from "react";
import { MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapProps {
  stableLat: number;
  stableLng: number;
  stableName: string;
  stableAddress?: string;
}

export default function LocationMap({ stableLat, stableLng, stableName, stableAddress }: LocationMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [customIcon, setCustomIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
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
    });
  }, []);

  if (!isMounted) return null;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-[#2D4A6E]" />
        <h3 className="font-semibold text-white">Stable Location</h3>
      </div>
      <Card className="overflow-hidden">
        <div className="h-[400px] w-full relative">
          <style>{`.leaflet-container { height: 100%; width: 100%; z-index: 0; } .leaflet-popup-content-wrapper { border-radius: 8px; }`}</style>
          <MapContainer center={[stableLat, stableLng]} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {customIcon && (
              <Marker position={[stableLat, stableLng]} icon={customIcon}>
                <Popup><div><strong>{stableName}</strong><br />{stableAddress || stableName}</div></Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </Card>
      <div className="rounded-lg border bg-white/5 p-4">
        <p className="text-sm text-white/70">📍 <strong>Meeting Point:</strong> {stableAddress || stableName}</p>
      </div>
    </div>
  );
}
