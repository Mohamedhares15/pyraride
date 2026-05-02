export type SupportedLocation =
  | "giza"
  | "saqqara"
  | "siwa"
  | "dahab"
  | "hurghada";

interface LocationMeta {
  name: string;
  latitude: number;
  longitude: number;
}

const LOCATION_COORDINATES: Record<SupportedLocation, LocationMeta> = {
  giza: {
    name: "Giza, Egypt",
    latitude: 29.9792,
    longitude: 31.1342,
  },
  saqqara: {
    name: "Saqqara, Egypt",
    latitude: 29.8713,
    longitude: 31.2167,
  },
  siwa: {
    name: "Siwa Oasis, Egypt",
    latitude: 29.2032,
    longitude: 25.5196,
  },
  dahab: {
    name: "Dahab, Egypt",
    latitude: 28.5095,
    longitude: 34.5136,
  },
  hurghada: {
    name: "Hurghada, Egypt",
    latitude: 27.2579,
    longitude: 33.8116,
  },
};

export type LocationKey = keyof typeof LOCATION_COORDINATES;

export function resolveLocationKey(input?: string | null): LocationKey {
  if (typeof input === "string") {
    const trimmed = input.trim().toLowerCase();
    if (trimmed in LOCATION_COORDINATES) {
      return trimmed as LocationKey;
    }
  }
  return "giza";
}

export function getLocationMeta(input?: string | null): LocationMeta & {
  key: LocationKey;
} {
  const key = resolveLocationKey(input);
  const meta = LOCATION_COORDINATES[key];
  return { key, ...meta };
}

export const SUPPORTED_LOCATIONS = Object.entries(LOCATION_COORDINATES).map(
  ([key, meta]) => ({
    key: key as LocationKey,
    ...meta,
  })
);


