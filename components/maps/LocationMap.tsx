"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { useMapEvents } from "react-leaflet";
import L from "leaflet";

// Import Leaflet CSS
if (typeof window !== "undefined") {
  require("leaflet/dist/leaflet.css");
  
  // Fix default marker icon issue in Next.js
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

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

// Component to handle map click events
function MapClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onClick(lat, lng);
    },
  });
  return null;
}

// Component to update map view when center changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

interface LocationMapProps {
  stableLat: number;
  stableLng: number;
  stableName: string;
  stableAddress?: string;
  riderLat?: number;
  riderLng?: number;
  onLocationSet?: (lat: number, lng: number) => void;
  showDistance?: boolean;
}

// Create custom icons for stable (red) and rider (blue)
const createIcon = (color: "red" | "blue") => {
  const iconColors: Record<string, { single: string; double: string }> = {
    red: {
      single: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
      double: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    },
    blue: {
      single: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
      double: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    },
  };

  return new L.Icon({
    iconUrl: iconColors[color].single,
    iconRetinaUrl: iconColors[color].double,
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

export default function LocationMap({
  stableLat,
  stableLng,
  stableName,
  stableAddress,
  riderLat,
  riderLng,
  onLocationSet,
  showDistance = true,
}: LocationMapProps) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    riderLat && riderLng ? [riderLat, riderLng] : null
  );
  const [distance, setDistance] = useState<number | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const markerRef = useRef<any>(null);

  // Calculate distance using Haversine formula (meters)
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  useEffect(() => {
    if (userLocation) {
      const dist = calculateDistance(userLocation[0], userLocation[1], stableLat, stableLng);
      setDistance(dist);
    }
  }, [userLocation, stableLat, stableLng]);

  async function getCurrentLocation() {
    setIsLoadingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(newLocation);
        if (onLocationSet) {
          onLocationSet(newLocation[0], newLocation[1]);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Could not get your location. Please allow location access or click on the map to set your location."
        );
        setIsLoadingLocation(false);
      }
    );
  }

  function handleMapClick(lat: number, lng: number) {
    if (!onLocationSet) return;
    const newLocation: [number, number] = [lat, lng];
    setUserLocation(newLocation);
    onLocationSet(lat, lng);
  }

  function handleMarkerDragEnd(e: any) {
    const marker = e.target;
    const position = marker.getLatLng();
    const newLocation: [number, number] = [position.lat, position.lng];
    setUserLocation(newLocation);
    if (onLocationSet) {
      onLocationSet(position.lat, position.lng);
    }
  }

  // Calculate center point - show both markers if user location exists
  const center: [number, number] = userLocation || [stableLat, stableLng];
  const zoom = userLocation ? 12 : 13;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Location & Distance</h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
        >
          {isLoadingLocation ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting...
            </>
          ) : (
            <>
              <Navigation className="mr-2 h-4 w-4" />
              Use My Location
            </>
          )}
        </Button>
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
            center={center}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
            className="z-0"
          >
            <MapUpdater center={center} zoom={zoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {onLocationSet && <MapClickHandler onClick={handleMapClick} />}
            
            {/* Stable Marker (Red) */}
            <Marker position={[stableLat, stableLng]} icon={createIcon("red")}>
              <Popup>
                <div>
                  <strong>{stableName}</strong>
                  <br />
                  {stableAddress || stableName}
                </div>
              </Popup>
            </Marker>
            
            {/* Rider Location Marker (Blue, Draggable) */}
            {userLocation && (
              <Marker
                position={userLocation}
                draggable={true}
                ref={markerRef}
                icon={createIcon("blue")}
                eventHandlers={{
                  dragend: handleMarkerDragEnd,
                }}
              >
                <Popup>
                  <div>
                    <strong>Your Location</strong>
                    <br />
                    Drag marker to adjust
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </Card>

      {distance !== null && showDistance && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Distance to Stable</p>
              <p className="text-2xl font-bold text-primary">
                {distance < 1000
                  ? `${Math.round(distance)} m`
                  : `${(distance / 1000).toFixed(2)} km`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Drive Time</p>
              <p className="text-lg font-semibold">
                {distance < 1000
                  ? "< 1 min"
                  : `${Math.round((distance / 1000) * 2)} min`}
              </p>
            </div>
          </div>
          {userLocation && (
            <p className="mt-2 text-xs text-muted-foreground">
              💡 You can drag the blue marker to adjust your location
            </p>
          )}
        </div>
      )}

      {!userLocation && (
        <p className="text-sm text-muted-foreground text-center">
          Click on the map or use "Use My Location" to set your pickup point
        </p>
      )}
    </div>
  );
}
