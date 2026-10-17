/** Optional Maps feature flag. The Places UI itself is lazy-loaded in MapsLocation.jsx. */
export const mapsEnabled = () => import.meta.env.VITE_ENABLE_GOOGLE_MAPS === 'true' && Boolean(import.meta.env.VITE_GOOGLE_MAPS_API_KEY?.trim());
/**
 * Kept as a service boundary for future server-backed geocoding. Current address selection
 * is handled by Google Places Autocomplete in the browser; this helper never makes a paid
 * request and intentionally returns the manual fallback rather than throwing.
 */
export async function geocodeAddress(address) {
  if (!mapsEnabled()) return { enabled: false, fallback: 'manual', address };
  return { enabled: true, fallback: 'places-autocomplete', address, note: 'Select an address using the MapsLocation UI.' };
}
