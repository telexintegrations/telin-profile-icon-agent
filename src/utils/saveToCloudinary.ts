import { Readable } from 'stream';
import cloudinary from '../config/cloudinaryConfig';

// Function to upload an image from a buffer to Cloudinary using a stream
export async function uploadImageToCloudinary(imageBuffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          return reject(new Error(`Cloudinary Upload Error: ${error.message}`));
        }
        // Ensure secure_url exists, otherwise reject with an appropriate message
        if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Failed to upload image: secure_url not returned'));
        }
      }
    );

    // Create a readable stream from the buffer and pipe it into the Cloudinary upload stream
    Readable.from(imageBuffer).pipe(uploadStream);
  });
}
