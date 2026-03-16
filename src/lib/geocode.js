/**
 * Geocode an address string using the OpenStreetMap Nominatim API.
 *
 * Returns { lat, lng } on success, or null when nothing was found or the
 * request failed. Never throws — callers can safely fire-and-forget.
 *
 * Nominatim requires an identifying User-Agent and asks for at most
 * 1 request per second from any single client.
 *
 * @param {string} query  Free-form address string, e.g. "Spice Garden, Bengaluru, MG Road"
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
export async function geocodeAddress(query) {
  if (!query?.trim()) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=1`;

    const res = await fetch(url, {
      headers: {
        // Nominatim policy: identify your app and contact point
        "User-Agent": "MenuBuddy/1.0 (contact@menubuddy.co.in)",
        "Accept-Language": "en",
      },
      // Hard timeout so a slow response never blocks a registration
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    return { lat, lng };
  } catch {
    // Network error, timeout, or parse failure — non-fatal
    return null;
  }
}
