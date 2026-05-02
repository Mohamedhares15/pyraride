"use client";

import { useEffect, useState } from "react";
import dynamic from '@/shims/next-dynamic';
import { Loader2 } from "lucide-react";

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const CircleMarker = dynamic(() => import("react-leaflet").then((mod) => mod.CircleMarker), { ssr: false });

interface DriverMapProps {
  orders: any[];
  driverLocation: [number, number] | null;
  onDistanceCalculated?: (orderId: string, distanceKm: number) => void;
}

const ZONE_COORDINATES: Record<string, [number, number]> = {
  "Zamalek": [30.0626, 31.2223],
  "Maadi": [29.9602, 31.2569],
  "Heliopolis": [30.0911, 31.3283],
  "New Cairo": [30.0300, 31.4700],
  "Giza": [30.0131, 31.2089],
  "Downtown Cairo": [30.0444, 31.2357],
  "Sheikh Zayed": [30.0489, 30.9850],
  "6th of October": [29.9381, 30.9136],
};

function getCoordinatesForZone(zoneName: string): [number, number] {
  if (!zoneName) return [30.0444, 31.2357];
  
  // Try exact match or partial match
  const match = Object.keys(ZONE_COORDINATES).find(k => zoneName.toLowerCase().includes(k.toLowerCase()));
  if (match) return ZONE_COORDINATES[match];
  
  // Default fallback (somewhere around Cairo)
  // We add a tiny bit of random to separate markers falling completely on the same default point
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;
  return [30.0444 + latOffset, 31.2357 + lngOffset];
}

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function DriverMap({ orders, driverLocation, onDistanceCalculated }: DriverMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [riderIcon, setRiderIcon] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);

    import("leaflet").then((L) => {
      // Fix default icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // Marker for riders waiting
      const greenIcon = new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
        iconRetinaUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
      setRiderIcon(greenIcon);

      require("leaflet/dist/leaflet.css");
    });
  }, []);

  // Calculate and emit distances
  useEffect(() => {
    if (driverLocation && orders.length > 0 && onDistanceCalculated) {
      orders.forEach(order => {
        const coords = getCoordinatesForZone(order.transportationZone);
        const dist = calculateDistance(driverLocation[0], driverLocation[1], coords[0], coords[1]);
        onDistanceCalculated(order.id, dist);
      });
    }
  }, [driverLocation, orders, onDistanceCalculated]);

  if (!isMounted) return null;

  // Center on driver if we have it, else center on Cairo, else center on first order
  const defaultCenter: [number, number] = driverLocation || 
    (orders.length > 0 ? getCoordinatesForZone(orders[0].transportationZone) : [30.0444, 31.2357]);

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#111]">
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-container { height: 100%; width: 100%; z-index: 0; font-family: inherit; }
        .leaflet-layer, .leaflet-control-zoom-in, .leaflet-control-zoom-out, .leaflet-control-attribution { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-popup-content-wrapper { background-color: #141414; color: white; border: 1px solid rgba(255,255,255,0.1); }
        .leaflet-popup-tip { background-color: #141414; }
      ` }} />

      <MapContainer
        center={defaultCenter}
        zoom={driverLocation ? 13 : 11}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {/* Driver Location Marker */}
        {driverLocation && (
          <CircleMarker 
            center={driverLocation} 
            radius={8} 
            pathOptions={{ color: '#0066FF', fillColor: '#3B82F6', fillOpacity: 1, weight: 3 }}
          >
            <Popup>
              <strong>Your Car</strong>
            </Popup>
          </CircleMarker>
        )}

        {/* Pulse effect around driver */}
        {driverLocation && (
           <CircleMarker 
             center={driverLocation} 
             radius={25} 
             pathOptions={{ color: 'transparent', fillColor: '#3B82F6', fillOpacity: 0.15 }}
           />
        )}

        {/* Rider Pickup Points */}
        {riderIcon && orders.map(order => {
          const coords = getCoordinatesForZone(order.transportationZone);
          return (
            <Marker key={order.id} position={coords} icon={riderIcon}>
              <Popup>
                <div className="flex flex-col gap-1 p-1">
                  <span className="font-bold">{order.transportationZone}</span>
                  <span className="text-xs text-white/60">{order.rider?.fullName || 'Guest'}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
