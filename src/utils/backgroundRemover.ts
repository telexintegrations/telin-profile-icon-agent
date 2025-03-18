import { removeBackgroundFromImageUrl } from 'remove.bg';
import dotenv from 'dotenv';

dotenv.config(); // Load REMOVE_BG_API_KEY from .env

export async function removeBackground(imageUrl: string): Promise<Buffer> {
  try {
    console.log("Removing background from image:", imageUrl);

    // Call remove.bg API with the image URL
    const result = await removeBackgroundFromImageUrl({
      url: imageUrl,
      apiKey: process.env.REMOVE_BG_API_KEY as string, // Ensure API key is set
      size: "auto",
      type: "auto",
      format: "png",
    });

    // Convert the base64 response to a Buffer
    return Buffer.from(result.base64img, 'base64');
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error("Failed to remove background.");
  }
}
