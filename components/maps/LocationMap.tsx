"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

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
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    riderLat && riderLng ? { lat: riderLat, lng: riderLng } : null
  );

  useEffect(() => {
    // Load Google Maps script
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
    if (!apiKey) {
      console.warn("Google Maps API key not configured. Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file");
      return;
    }

    if (!window.google) {
      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        // Script is already loading, wait for it
        const checkGoogle = setInterval(() => {
          if (window.google) {
            clearInterval(checkGoogle);
            initializeMap();
          }
        }, 100);
        return () => clearInterval(checkGoogle);
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initMap`;
      script.async = true;
      script.defer = true;
      window.initMap = () => {
        if (window.google && mapRef.current) {
          initializeMap();
        }
      };
      document.head.appendChild(script);

      return () => {
        // Note: Don't remove script on unmount as it may be used by other components
      };
    } else {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (map && stableLat && stableLng && window.google) {
      updateMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, stableLat, stableLng, userLocation]);

  function initializeMap() {
    if (!mapRef.current) return;
    if (!window.google) {
      // Wait a bit for script to load
      setTimeout(() => {
        if (window.google) {
          initializeMap();
        }
      }, 100);
      return;
    }

    const center = userLocation || { lat: stableLat, lng: stableLng };

    const newMap = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 13,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(newMap);

    // Add stable marker
    const stableMarker = new window.google.maps.Marker({
      position: { lat: stableLat, lng: stableLng },
      map: newMap,
      title: stableName,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      },
    });

    const stableInfoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding: 8px;"><strong>${stableName}</strong><br/>${stableAddress || stableName}</div>`,
    });

    stableMarker.addListener("click", () => {
      stableInfoWindow.open(newMap, stableMarker);
    });

    setMarkers([stableMarker]);

    // If user location is provided, add user marker and calculate distance
    if (userLocation) {
      addUserMarker(newMap, userLocation);
      calculateDistance(userLocation.lat, userLocation.lng);
    }

    // Add click listener to set rider location
    if (onLocationSet) {
      newMap.addListener("click", (e: any) => {
        const clickedLat = e.latLng.lat();
        const clickedLng = e.latLng.lng();
        const newUserLocation = { lat: clickedLat, lng: clickedLng };
        setUserLocation(newUserLocation);
        addUserMarker(newMap, newUserLocation);
        calculateDistance(clickedLat, clickedLng);
        onLocationSet(clickedLat, clickedLng);
      });
    }
  }

  function addUserMarker(mapInstance: any, location: { lat: number; lng: number }) {
    // Remove existing user marker (keep stable marker which is first)
    const newMarkers = [...markers];
    newMarkers.slice(1).forEach((marker) => {
      marker.setMap(null);
    });

    const userMarker = new window.google.maps.Marker({
      position: location,
      map: mapInstance,
      title: "Your Location",
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
      draggable: true,
    });

    userMarker.addListener("dragend", (e: any) => {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      const newUserLocation = { lat: newLat, lng: newLng };
      setUserLocation(newUserLocation);
      calculateDistance(newLat, newLng);
      if (onLocationSet) {
        onLocationSet(newLat, newLng);
      }
    });

    setMarkers((prev) => [prev[0], userMarker]);

    // Fit bounds to show both markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: stableLat, lng: stableLng });
    bounds.extend(location);
    mapInstance.fitBounds(bounds);
  }

  function calculateDistance(riderLat: number, riderLng: number) {
    if (!window.google || !showDistance) return;

    const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
      new window.google.maps.LatLng(riderLat, riderLng),
      new window.google.maps.LatLng(stableLat, stableLng)
    );

    // Convert meters to kilometers
    const distanceKm = distance / 1000;
    setDistance(distanceKm);

    // Draw route if directions service is available
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
    }

    const directionsService = new window.google.maps.DirectionsService();
    const renderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
    });
    setDirectionsRenderer(renderer);

    directionsService.route(
      {
        origin: { lat: riderLat, lng: riderLng },
        destination: { lat: stableLat, lng: stableLng },
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result: any, status: any) => {
        if (status === "OK") {
          renderer.setDirections(result);
        }
      }
    );
  }

  function updateMap() {
    if (!map || !window.google) return;

    if (userLocation) {
      addUserMarker(map, userLocation);
      calculateDistance(userLocation.lat, userLocation.lng);
    }
  }

  async function getCurrentLocation() {
    setIsLoadingLocation(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newLocation);
        if (map) {
          addUserMarker(map, newLocation);
          calculateDistance(newLocation.lat, newLocation.lng);
        }
        if (onLocationSet) {
          onLocationSet(newLocation.lat, newLocation.lng);
        }
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your location. Please allow location access or click on the map to set your location.");
        setIsLoadingLocation(false);
      }
    );
  }

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
        <div ref={mapRef} className="h-[400px] w-full" />
      </Card>

      {distance !== null && showDistance && (
        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Distance to Stable</p>
              <p className="text-2xl font-bold text-primary">
                {distance < 1
                  ? `${(distance * 1000).toFixed(0)} m`
                  : `${distance.toFixed(2)} km`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimated Drive Time</p>
              <p className="text-lg font-semibold">
                {distance < 1
                  ? "< 1 min"
                  : `${Math.round(distance * 2)} min`}
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

