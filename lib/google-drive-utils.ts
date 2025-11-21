/**
 * Converts a Google Drive shareable link to a direct image URL
 * Supports multiple formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function convertGoogleDriveUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();
  
  // Extract file ID from ANY Google Drive URL format
  let fileId: string | null = null;

  // Format 1: /file/d/FILE_ID/view or /file/d/FILE_ID
  const viewMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (viewMatch) {
    fileId = viewMatch[1];
  }

  // Format 2: /open?id=FILE_ID or /uc?id=FILE_ID
  if (!fileId) {
    const openMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openMatch) {
      fileId = openMatch[1];
    }
  }

  // Format 3: /d/FILE_ID (generic)
  if (!fileId) {
    const genericMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (genericMatch) {
      fileId = genericMatch[1];
    }
  }

  // Format 4: Already in thumbnail or usercontent format - extract ID and reconvert
  if (!fileId && trimmed.includes("drive.google")) {
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) {
      fileId = idMatch[1];
    }
  }

  if (fileId) {
    // Use usercontent.google.com domain which doesn't have CORS restrictions
    // This format works reliably for embedding images in websites
    return `https://drive.usercontent.google.com/download?id=${fileId}&export=view&authuser=0`;
  }

  // If it's already a full HTTP URL but not Google Drive, return as-is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // Only return non-Google-Drive URLs as-is
    if (!trimmed.includes("drive.google.com") && !trimmed.includes("googleusercontent.com")) {
      return trimmed;
    }
  }

  // If it's a relative path, return as-is
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  return null;
}

/**
 * Converts multiple Google Drive URLs (from textarea input)
 */
export function convertGoogleDriveUrls(input: string): string[] {
  if (!input || typeof input !== "string") {
    return [];
  }

  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((url) => convertGoogleDriveUrl(url))
    .filter((url): url is string => url !== null);
}

