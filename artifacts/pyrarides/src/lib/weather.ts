export interface WeatherData {
    temp: number;
    condition: 'Clear' | 'Clouds' | 'Rain' | 'Wind' | 'Extreme';
    description: string;
    icon: string;
    isSafeToRide: boolean;
    windSpeed: number;
}

// Mock data for demonstration if no API key is present
const MOCK_WEATHER: WeatherData = {
    temp: 28,
    condition: 'Clear',
    description: 'Sunny and clear sky',
    icon: '☀️',
    isSafeToRide: true,
    windSpeed: 12,
};

export async function getWeatherForecast(date: Date): Promise<WeatherData> {
    // In a real app, we would call OpenWeatherMap API here
    // const response = await fetch(\`https://api.openweathermap.org/data/2.5/forecast?...\`);

    // For the competition demo, we simulate a network call and return mock data
    // We can randomize it slightly based on the date to show "dynamic" behavior
    await new Promise((resolve) => setTimeout(resolve, 500));

    const isHot = date.getHours() > 11 && date.getHours() < 15;

    if (isHot) {
        return {
            ...MOCK_WEATHER,
            temp: 35,
            condition: 'Clear',
            description: 'High heat expected',
            isSafeToRide: true, // Still safe but maybe warning
        };
    }

    return MOCK_WEATHER;
}

export function getWeatherWarning(weather: WeatherData): string | null {
    if (!weather.isSafeToRide) {
        return "⚠️ Weather Alert: High winds or extreme heat make riding unsafe.";
    }
    if (weather.temp > 32) {
        return "☀️ Heat Warning: It will be hot. Please bring water and wear sunscreen.";
    }
    if (weather.windSpeed > 25) {
        return "💨 Wind Warning: Strong winds expected.";
    }
    return null;
}
