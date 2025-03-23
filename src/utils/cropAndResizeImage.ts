import sharp from 'sharp';
import axios from 'axios';
import { stylePresets } from './styles';

export async function cropAndResizeImage(
  photoUrl: string,
  faceData: { coordinates: any; padding: number },
  styleKey: keyof typeof stylePresets // Expect one of the predefined styles
) {
  const { coordinates, padding } = faceData;
  const style = stylePresets[styleKey]; // Get the style settings based on user selection

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

  // Apply filters based on the style
  if ('grayscale' in style) processedImage = processedImage.grayscale();
  if ('sepia' in style) processedImage = processedImage.tint({ r: 112, g: 66, b: 20 });
  if ('contrast' in style) processedImage = processedImage.linear(style.contrast, 0);
  if ('blur' in style) processedImage = processedImage.blur(style.blur);
  if ('sharpness' in style) processedImage = processedImage.sharpen(style.sharpness);
  if ('saturation' in style) processedImage = processedImage.modulate({ saturation: style.saturation });
  if ('brightness' in style) processedImage = processedImage.modulate({ brightness: style.brightness });
  if ('hueshift' in style) processedImage = processedImage.modulate({ hue: style.hueshift });
  if ('vignette' in style) processedImage = processedImage.tint({ r: 0, g: 0, b: 0 }).modulate({ brightness: 0.9 });

  return processedImage.toBuffer();
}
