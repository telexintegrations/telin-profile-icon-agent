import sharp from 'sharp';

/**
 * Enhances image quality by adjusting brightness and contrast.
 * @param imageBuffer - The image buffer to be enhanced.
 * @returns The optimized image buffer.
 */
export const enhanceImageQuality = async (imageBuffer: Buffer): Promise<Buffer> => {
  return await sharp(imageBuffer)
    .modulate({ brightness: 1.2 })
    .linear(1.3, 0)
    .toBuffer();
};
