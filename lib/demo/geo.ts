import { KM_STEP } from "./constants";

export interface Area { suburb: string; city: string; province: string; lat: number; lng: number }

export const AREAS: Record<string, Area> = {
  hatfield: { suburb: "Hatfield", city: "Pretoria", province: "Gauteng", lat: -25.7487, lng: 28.238 },
  arcadia: { suburb: "Arcadia", city: "Pretoria", province: "Gauteng", lat: -25.7445, lng: 28.2105 },
  sunnyside: { suburb: "Sunnyside", city: "Pretoria", province: "Gauteng", lat: -25.756, lng: 28.205 },
  brooklyn: { suburb: "Brooklyn", city: "Pretoria", province: "Gauteng", lat: -25.771, lng: 28.238 },
  menlopark: { suburb: "Menlo Park", city: "Pretoria", province: "Gauteng", lat: -25.77, lng: 28.258 },
  waterkloof: { suburb: "Waterkloof", city: "Pretoria", province: "Gauteng", lat: -25.78, lng: 28.248 },
  garsfontein: { suburb: "Garsfontein", city: "Pretoria", province: "Gauteng", lat: -25.792, lng: 28.294 },
  cbd: { suburb: "Pretoria Central", city: "Pretoria", province: "Gauteng", lat: -25.7461, lng: 28.1881 },
  montana: { suburb: "Montana", city: "Pretoria", province: "Gauteng", lat: -25.678, lng: 28.254 },
  lyttelton: { suburb: "Lyttelton", city: "Centurion", province: "Gauteng", lat: -25.834, lng: 28.208 },
  centurion: { suburb: "Centurion Central", city: "Centurion", province: "Gauteng", lat: -25.8603, lng: 28.1894 },
  midrand: { suburb: "Midrand", city: "Midrand", province: "Gauteng", lat: -25.999, lng: 28.126 },
};

export const AREA_KEYS = Object.keys(AREAS);

export const area = (key: string): Area => AREAS[key] ?? AREAS.hatfield;

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const roundKm = (km: number, step = KM_STEP) => Math.max(step, Math.round(km / step) * step);

export const km = (a: string, b: string) => roundKm(haversineKm(area(a), area(b)));

const DEFAULT_ADDRESSES: Record<string, string> = {
  arcadia: "22 Park Street, Arcadia, Pretoria",
  centurion: "8 Jean Avenue, Centurion",
  midrand: "41 New Road, Midrand",
  hatfield: "14 Burnett Street, Hatfield, Pretoria",
};

export const defaultAddress = (key: string) => DEFAULT_ADDRESSES[key] ?? `12 Main Road, ${area(key).suburb}`;
