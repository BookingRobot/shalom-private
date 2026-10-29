/** SVG path data (24×24, stroke) for amenity / programme icons. */
export const ICON_PATHS: Record<string, string> = {
  bed2: 'M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7M3 18h18M5 9V6h6v3M13 9V6h6v3',
  bed1: 'M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M6 10V7h12v3',
  balcony: 'M3 11h18M5 11v8M9 11v8M13 11v8M17 11v8M3 19h18M6 11V5h12v6',
  ac: 'M3 6h18v7H3zM7 16v3M12 16v4M17 16v3M6 10h12',
  wifi: 'M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01',
  shower: 'M4 20V7a4 4 0 0 1 8 0M8 11h8M9 14v1M12 14v1M15 14v1M9 18v1M12 18v1M15 18v1',
  bath: 'M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19v2M17 19v2',
  area: 'M4 4h16v16H4zM4 9h5M4 14h3M9 4v5M14 4v3',
  tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
  kettle: 'M6 9h11a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3H6zM6 9V7h8v2M6 12H4M9 20h6',
  fridge: 'M6 3h12v18H6zM6 10h12M9 6v2M9 13v3',
  meals: 'M7 3v18M5 3v5a2 2 0 0 0 4 0V3M17 3c-2 0-3 2-3 5v3h3v10M17 3v8',
  // stethoscope
  doctor:
    'M11 2v2M5 2v2M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1M8 15a6 6 0 0 0 12 0v-3M22 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
  proc: 'M12 20c-2-2-3-5-3-8 0-3 1-6 3-8 2 2 3 5 3 8 0 3-1 6-3 8zM12 20c-4-1-7-4-8-8 3 0 6 2 8 5M12 20c4-1 7-4 8-8-3 0-6 2-8 5M4 20c3 1 5 1 8 0 3 1 5 1 8 0',
  massage: 'M12 20c-4 0-8-3-8-7 2 0 4 1 5 2-1-3 0-7 3-9 3 2 4 6 3 9 1-1 3-2 5-2 0 4-4 7-8 7z',
  gym: 'M2 12h3M19 12h3M5 8v8M8 6v12M16 6v12M19 8v8M8 12h8',
  pool: 'M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0M7 14V6a2 2 0 0 1 4 0M13 14V6a2 2 0 0 1 4 0M7 10h6',
  aqua: 'M3 20h18M4 16c6 0 8-10 14-10M12 11l3 3M16 9l3 3',
  sauna: 'M8 4c-1 2 1 3 0 5M12 4c-1 2 1 3 0 5M16 4c-1 2 1 3 0 5M4 12h16v8H4zM8 16h8',
  safe: 'M4 4h16v16H4zM8 8h8v8H8zM12 12h.01M20 9h2M20 15h2',
  parking: 'M6 20V4h7a4 4 0 0 1 0 8H6',
  lift: 'M4 3h16v18H4zM12 3v18M8 10l0-3M16 10l0-3M8 14v3M16 14v3',
  bar: 'M5 3h14l-7 8zM12 11v8M8 19h8',
  beach: 'M3 20h18M12 4c-5 0-8 4-8 8h16c0-4-3-8-8-8zM12 12v8',
  ski: 'M4 20l16-6M6 14l4-8 6 4',
  bike: 'M5 17a3 3 0 1 0 0 .01M19 17a3 3 0 1 0 0 .01M5 17l5-8h6l3 8M10 9l4 8M14 9h-3',
  tennis: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5 7c4 1 8 5 9 9M19 17c-4-1-8-5-9-9',
  library: 'M4 4h6v16H4zM10 4h6v16h-6zM16 6l4-1 3 14-4 1z',
  water: 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11zM9 15a3 3 0 0 0 3 3',
  salt: 'M8 3h8v4H8zM6 7h12l1 14H5zM12 12v5',
  mud: 'M4 16c2-2 5-2 8 0s6 2 8 0M4 20c2-2 5-2 8 0s6 2 8 0M9 8a3 3 0 1 1 6 0c0 3-3 3-3 6',
};

export interface Amenity {
  /** SVG path */
  d: string;
  t: string;
}

/** amenity('pool', 'Бассейны и сауны') → icon + label */
export const amenity = (key: string, text: string): Amenity => ({ d: ICON_PATHS[key], t: text });
