import { useQuery } from "@tanstack/react-query";
import { api, type StableFilters } from "./client";

export const stableKeys = {
  list: (f: StableFilters) => ["stables", f] as const,
  detail: (id: string) => ["stable", id] as const,
  horses: (stableId: string) => ["stable", stableId, "horses"] as const,
  reviews: (stableId: string) => ["stable", stableId, "reviews"] as const,
  slots: (stableId: string, date: string, horseId?: string) =>
    ["stable", stableId, "slots", date, horseId ?? ""] as const,
};

export const useStables = (filters: StableFilters = {}) =>
  useQuery({ queryKey: stableKeys.list(filters), queryFn: () => api.listStables(filters) });

export const useHorses = (filters: StableFilters = {}) =>
  useQuery({ queryKey: ["horses", filters], queryFn: () => api.listHorses(filters) });

export const useStable = (id: string | undefined) =>
  useQuery({
    queryKey: stableKeys.detail(id ?? ""),
    queryFn: () => api.getStable(id!),
    enabled: !!id,
  });

export const useHorse = (id: string | undefined) =>
  useQuery({
    queryKey: ["horse", id],
    queryFn: () => api.getHorse(id!),
    enabled: !!id,
  });

export const useStableHorses = (stableId: string | undefined) =>
  useQuery({
    queryKey: stableKeys.horses(stableId ?? ""),
    queryFn: () => api.listHorsesForStable(stableId!),
    enabled: !!stableId,
  });

export const useStableSlots = (
  stableId: string | undefined,
  date: string | undefined,
  horseId?: string,
) =>
  useQuery({
    queryKey: stableKeys.slots(stableId ?? "", date ?? "", horseId),
    queryFn: () => api.getStableSlots(stableId!, date!, horseId),
    enabled: !!stableId && !!date,
  });

export const usePackages = (opts: { featured?: boolean; type?: "PRIVATE_VIP" | "GROUP_EVENT" } = {}) =>
  useQuery({ queryKey: ["packages", opts], queryFn: () => api.listPackages(opts) });

export const usePackage = (id: string | undefined) =>
  useQuery({
    queryKey: ["package", id],
    queryFn: () => api.getPackage(id!),
    enabled: !!id,
  });

export const useReviews = (opts: { stableId?: string; limit?: number } = {}) =>
  useQuery({ queryKey: ["reviews", opts], queryFn: () => api.listReviews(opts) });

export const useAcademies = () =>
  useQuery({ queryKey: ["academies"], queryFn: () => api.listAcademies() });

export const useGallery = () =>
  useQuery({ queryKey: ["gallery"], queryFn: () => api.listGallery() });

export const useLeaderboard = () =>
  useQuery({ queryKey: ["leaderboard"], queryFn: () => api.getLeaderboard() });

export const useLocations = () =>
  useQuery({ queryKey: ["locations"], queryFn: () => api.listLocations() });

export const useTransportZones = () =>
  useQuery({ queryKey: ["transport-zones"], queryFn: () => api.listTransportZones() });
