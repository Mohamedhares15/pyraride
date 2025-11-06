"use client";

import { useEffect, useState } from "react";
import { MapPin, Sun, Cloud, CloudRain, Droplets, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: "sun" | "cloud" | "rain";
  feelsLike?: number;
}

const defaultWeather: WeatherData = {
  temperature: 25,
  condition: "Sunny",
  humidity: 58,
  windSpeed: 11,
  icon: "sun",
  feelsLike: 25,
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData>(defaultWeather);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch real weather data
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/weather");
        
        if (!response.ok) {
          throw new Error("Failed to fetch weather");
        }

        const data = await response.json();
        
        // Map condition to icon
        const conditionLower = data.condition.toLowerCase();
        let icon: "sun" | "cloud" | "rain" = "sun";
        if (conditionLower.includes("rain") || conditionLower.includes("storm")) {
          icon = "rain";
        } else if (conditionLower.includes("cloud") || conditionLower.includes("overcast") || conditionLower.includes("mist")) {
          icon = "cloud";
        }
        
        setWeather({
          temperature: data.temperature,
          condition: data.condition,
          humidity: data.humidity,
          windSpeed: data.windSpeed,
          icon: icon,
          feelsLike: data.feelsLike || data.temperature,
        });
      } catch (error) {
        console.error("Error fetching weather:", error);
        // Keep default weather on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    
    return () => clearInterval(interval);
  }, []);

  const getIcon = () => {
    switch (weather.icon) {
      case "sun":
        return <Sun className="h-6 w-6 text-yellow-400" />;
      case "cloud":
        return <Cloud className="h-6 w-6 text-gray-400" />;
      case "rain":
        return <CloudRain className="h-6 w-6 text-blue-400" />;
      default:
        return <Sun className="h-6 w-6 text-yellow-400" />;
    }
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
            <MapPin className="h-3 w-3 md:h-4 md:w-4" />
            Giza, Egypt
          </div>
          <div className="mt-2 flex items-center gap-2">
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : (
              getIcon()
            )}
            <div>
              {isLoading ? (
                <>
                  <p className="text-xl md:text-3xl font-bold">--°C</p>
                  <p className="text-xs md:text-sm text-muted-foreground">Loading...</p>
                </>
              ) : (
                <>
                  <p className="text-xl md:text-3xl font-bold">{weather.temperature}°C</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{weather.condition}</p>
                </>
              )}
            </div>
          </div>
        </div>
        
        {!isLoading && (
          <div className="flex flex-col gap-1 md:gap-2 text-xs md:text-sm">
            <div className="flex items-center gap-1 md:gap-2">
              <Droplets className="h-3 w-3 md:h-4 md:w-4 text-primary" />
              <span>{weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-muted-foreground">Wind</span>
              <span>{weather.windSpeed} km/h</span>
            </div>
          </div>
        )}
      </div>
      
      {!isLoading && (
        <p className="mt-3 md:mt-4 text-xs text-muted-foreground">
          {weather.feelsLike && weather.feelsLike !== weather.temperature && (
            <span className="mr-2">Feels like {weather.feelsLike}°C</span>
          )}
          {weather.icon === "sun" ? "Perfect weather for horse riding today! ☀️" : weather.icon === "cloud" ? "Great weather for an evening ride! ☁️" : "Bring a jacket just in case! 🌧️"}
        </p>
      )}
    </Card>
  );
}

