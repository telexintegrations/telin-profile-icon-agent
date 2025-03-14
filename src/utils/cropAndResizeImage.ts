import sharp from 'sharp';
import axios from 'axios';

export async function cropAndResizeImage(photoUrl: string, faceData: { coordinates: any, padding: number }) {
  const { coordinates, padding } = faceData;

  const imageResponse = await axios.get(photoUrl, { responseType: 'arraybuffer' });
  const imageBuffer = Buffer.from(imageResponse.data, 'binary');

  const metadata = await sharp(imageBuffer).metadata();
  const imageWidth = metadata.width || 0;
  const imageHeight = metadata.height || 0;

  let x = Math.max(coordinates.xmin - padding, 0);
  let y = Math.max(coordinates.ymin - padding, 0);
  let width = coordinates.xmax - coordinates.xmin + 2 * padding;
  let height = coordinates.ymax - coordinates.ymin + 2 * padding;

  if (x + width > imageWidth) {
    width = imageWidth - x;
  }
  if (y + height > imageHeight) {
    height = imageHeight - y;
  }

  const maxDimension = Math.max(width, height);

  const croppedAndSquaredImage = await sharp(imageBuffer)
    .extract({ left: x, top: y, width, height })
    .resize(maxDimension, maxDimension, { fit: 'cover' })
    .jpeg({ quality: 90 })
    .toBuffer();

  return croppedAndSquaredImage;
}
