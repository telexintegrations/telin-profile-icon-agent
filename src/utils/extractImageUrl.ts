export function extractImageUrl(message: string): string | null {
  const parts = message.split(' ');
  if (parts.length === 2 && parts[0] === '/image') {
    const url = parts[1];
    try {
      new URL(url);  // Validate URL
      return url;
    } catch (e) {
      console.error('Invalid URL:', e);
      return null;
    }
  }
  return null;
}
