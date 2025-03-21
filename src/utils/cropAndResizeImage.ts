import sharp from 'sharp';
import axios from 'axios';

export async function cropAndResizeImage(
  photoUrl: string,
  faceData: { coordinates: any; padding: number },
  style: any | null
) {
  const { coordinates, padding } = faceData;

  // Fetch the image from URL
  const imageResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(imageResponse.data, 'binary');

  // Get metadata
  const metadata = await sharp(imageBuffer).metadata();
  const imageWidth = metadata.width || 0;
  const imageHeight = metadata.height || 0;

  // Compute cropping dimensions
  let x = Math.max(coordinates.xmin - padding, 0);
  let y = Math.max(coordinates.ymin - padding, 0);
  let width = coordinates.xmax - coordinates.xmin + 2 * padding;
  let height = coordinates.ymax - coordinates.ymin + 2 * padding;

  if (x + width > imageWidth) width = imageWidth - x;
  if (y + height > imageHeight) height = imageHeight - y;

  const maxDimension = Math.max(width, height);

  // Start processing the image with Sharp
  let processedImage = sharp(imageBuffer)
    .extract({ left: x, top: y, width, height }) // Crop
    .resize(maxDimension, maxDimension, { fit: 'cover' }) // Make it square
    .png({ quality: 90 });

  // ✅ Only apply styles if style is defined
  if (style) {
    if (style.grayscale) processedImage = processedImage.grayscale();
    if (style.sepia) processedImage = processedImage.tint({ r: 112, g: 66, b: 20 });
    if (style.contrast) processedImage = processedImage.linear(style.contrast, 0);
    if (style.blur) processedImage = processedImage.blur(style.blur);
    if (style.sharpness) processedImage = processedImage.sharpen(style.sharpness);
  } else {
    console.log("No style selected, using default cropping.");
  }

  return processedImage.toBuffer();
}
