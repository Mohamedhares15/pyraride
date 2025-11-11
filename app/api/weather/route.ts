import { NextRequest, NextResponse } from "next/server";
import { getLocationMeta } from "@/lib/location-coordinates";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

const WEATHER_CODE_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Light freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Light freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snowfall",
  73: "Moderate snowfall",
  75: "Heavy snowfall",
  77: "Snow grains",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

function getWeatherDescription(code?: number | null): string {
  if (code === undefined || code === null) {
    return "Clear sky";
  }
  return WEATHER_CODE_DESCRIPTIONS[code] ?? "Clear sky";
}

function coerceNumber(value: unknown, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) {
    return Math.round(Number(value));
  }
  return fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const locationParam = searchParams.get("location");
  const locationMeta = getLocationMeta(locationParam ?? undefined);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  try {
    const {
      key: resolvedLocationKey,
      latitude: defaultLat,
      longitude: defaultLon,
      name: locationName,
    } = locationMeta;

    const latitude =
      latParam && !Number.isNaN(Number(latParam))
        ? Number(latParam)
        : defaultLat;
    const longitude =
      lonParam && !Number.isNaN(Number(lonParam))
        ? Number(lonParam)
        : defaultLon;

    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", latitude.toString());
    url.searchParams.set("longitude", longitude.toString());
    url.searchParams.set(
      "current",
      [
        "temperature_2m",
        "apparent_temperature",
        "relative_humidity_2m",
        "wind_speed_10m",
        "weather_code",
      ].join(",")
    );
    url.searchParams.set("timezone", "Africa/Cairo");

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 },
      cache: "no-store",
    });

    const fallbackResponse = {
      temperature: 28,
      condition: "Clear sky",
      humidity: 45,
      windSpeed: 14,
      feelsLike: 30,
      weatherCode: null as number | null,
      location: locationName,
      locationKey: resolvedLocationKey,
    };

    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    const data = await response.json();
    const current = data?.current;

    if (!current) {
      console.error("Weather API error: missing current data", data);
      return NextResponse.json(fallbackResponse, { status: 200 });
    }

    const weatherCode = current.weather_code as number | undefined;

    return NextResponse.json({
      temperature: coerceNumber(current.temperature_2m, fallbackResponse.temperature),
      condition: getWeatherDescription(weatherCode),
      humidity: coerceNumber(current.relative_humidity_2m, fallbackResponse.humidity),
      windSpeed: coerceNumber(current.wind_speed_10m, fallbackResponse.windSpeed),
      feelsLike: coerceNumber(current.apparent_temperature, fallbackResponse.feelsLike),
      weatherCode: weatherCode ?? null,
      location: locationName,
      locationKey: resolvedLocationKey,
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    
    // Fallback to reasonable defaults
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 20 || hour < 6;
    
    return NextResponse.json({
      temperature: isNight ? 22 : 28,
      condition: isNight ? "Clear sky" : "Sunny",
      humidity: 45,
      windSpeed: 12,
      feelsLike: isNight ? 22 : 30,
      weatherCode: null,
      location: locationMeta.name,
      locationKey: locationMeta.key,
    });
  }
}

