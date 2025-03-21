import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config(); // Load REMOVE_BG_API_KEY from .env

export async function removeBackground(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log("Removing background from image buffer");

    // Prepare the form data to send the image buffer
    const form = new FormData();
    form.append('image_file', imageBuffer, { filename: 'image.png' });
    form.append('size', 'auto');
    form.append('type', 'auto');

    // Send request to remove.bg API
    const response = await axios.post(
      'https://api.remove.bg/v1.0/removebg',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'X-Api-Key': process.env.REMOVE_BG_API_KEY as string, // Ensure the API key is set
        },
        responseType: 'arraybuffer', // We want the response in binary format
      }
    );

    // Convert the response (binary data) to a Buffer and return it
    return Buffer.from(response.data);
  } catch (error) {
    console.error("Background removal failed:", error);
    throw new Error("Failed to remove background.");
  }
}
