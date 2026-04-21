export type ReverseGeocodeResult = {
  displayName: string;
  poiName?: string;
};

const cache = new Map<string, ReverseGeocodeResult>();
const forwardCache = new Map<string, { latitude: number; longitude: number; displayName?: string }>();

function cacheKey(lat: number, lon: number) {
  // keep cache coarse to avoid spamming network while dragging
  return `${lat.toFixed(5)},${lon.toFixed(5)}`;
}

export async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number,
  opts?: { signal?: AbortSignal }
): Promise<ReverseGeocodeResult | null> {
  const key = cacheKey(latitude, longitude);
  const cached = cache.get(key);
  if (cached) return cached;

  const url =
    'https://nominatim.openstreetmap.org/reverse' +
    `?format=jsonv2&lat=${encodeURIComponent(latitude)}` +
    `&lon=${encodeURIComponent(longitude)}` +
    '&zoom=18&addressdetails=1';

  const res = await fetch(url, {
    method: 'GET',
    signal: opts?.signal,
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'vi',
      'User-Agent': 'NT118App/1.0',
    },
  });

  if (!res.ok) return null;
  const json: any = await res.json();
  const displayName = (json?.display_name || '').toString();
  const poiName = (json?.name || '').toString() || undefined;

  if (!displayName) return null;

  const result: ReverseGeocodeResult = { displayName, poiName };
  cache.set(key, result);
  return result;
}

export async function forwardGeocodeNominatim(
  query: string,
  opts?: { signal?: AbortSignal }
): Promise<{ latitude: number; longitude: number; displayName?: string } | null> {
  const q = query.trim();
  if (!q) return null;

  const key = q.toLowerCase();
  const cached = forwardCache.get(key);
  if (cached) return cached;

  const parts = q.split(',').map((s) => s.trim()).filter(Boolean);

  let first: any = null;

  for (let i = 0; i < parts.length; i++) {
    const currentQuery = parts.slice(i).join(', ') + ', Việt Nam';
    const url =
      'https://nominatim.openstreetmap.org/search' +
      `?format=jsonv2&q=${encodeURIComponent(currentQuery)}` +
      '&limit=1&addressdetails=1';

    try {
      const res = await fetch(url, {
        method: 'GET',
        signal: opts?.signal,
        headers: {
          Accept: 'application/json',
          'Accept-Language': 'vi',
          'User-Agent': 'NT118App/1.0',
        },
      });

      if (res.ok) {
        const json: any = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          first = json[0];
          break; // Found a match, stop falling back
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') throw err; // propagate abort
      console.log('Nominatim forward geocode partial fail:', err.message);
    }
  }

  if (!first?.lat || !first?.lon) return null;

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const result = { latitude, longitude, displayName: first.display_name?.toString() };
  forwardCache.set(key, result);
  return result;
}

