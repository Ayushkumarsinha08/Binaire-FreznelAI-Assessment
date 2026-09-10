/**
 * Checksum utility using Web Crypto API.
 * Calculates SHA-256 hash of data string for large JSON integrity validation.
 */
export async function calculateChecksum(content: string): Promise<string> {
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch {
    // Fallback if subtle crypto unavailable
  }

  // Pure JS DJB2/FNV-1a fallback hash if crypto.subtle is unsupported in testing env
  let hash = 2166136261;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}
