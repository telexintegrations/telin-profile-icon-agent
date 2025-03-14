import { JSDOM } from 'jsdom';

export function extractImageUrl(message: string): string | null {
  const dom = new JSDOM(message);
  const anchorElement = dom.window.document.querySelector('a');

  // If an anchor element with a valid href exists, return its URL
  if (anchorElement && anchorElement.href) {
    return anchorElement.href;
  }

  return null; // Return null if no valid URL is found
}
