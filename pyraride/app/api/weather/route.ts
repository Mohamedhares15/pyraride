import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Revalidate every 5 minutes

export async function GET() {
  try {
    // Using OpenWeatherMap API (free tier)
    // You'll need to get an API key from https://openweathermap.org/api
    // For now, using a free alternative: wttr.in
    const response = await fetch(
      "https://wttr.in/Giza,Egypt?format=j1",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
        cache: "no-store", // Prevent caching issues
      }
    );

    if (!response.ok) {
      console.error(`Weather API error: ${response.status} ${response.statusText}`);
      throw new Error(`Weather API failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.current_condition || !data.current_condition[0]) {
      throw new Error("Invalid weather data format");
    }
    
    // Extract current weather from wttr.in response
    const current = data.current_condition[0];
    
    return NextResponse.json({
      temperature: parseInt(current.temp_C),
      condition: current.weatherDesc[0].value,
      humidity: parseInt(current.humidity),
      windSpeed: parseInt(current.windspeedKmph),
      feelsLike: parseInt(current.FeelsLikeC),
    });
  } catch (error) {
    console.error("Weather fetch error:", error);
    
    // Fallback to reasonable defaults
    const now = new Date();
    const hour = now.getHours();
    const isNight = hour >= 20 || hour < 6;
    
    return NextResponse.json({
      temperature: isNight ? 22 : 28,
      condition: isNight ? "Clear" : "Sunny",
      humidity: 45,
      windSpeed: 12,
      feelsLike: isNight ? 22 : 30,
    });
  }
}

