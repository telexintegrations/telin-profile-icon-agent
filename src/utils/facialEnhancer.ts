import sharp from 'sharp';

export async function enhanceFacialFeatures(imageBuffer: Buffer): Promise<Buffer> {
  try {
    console.log("Enhancing facial features with Sharp...");

    const enhancedImage = await sharp(imageBuffer)
      .sharpen() // Apply sharpening
      .toBuffer();

    return enhancedImage;
  } catch (error) {
    console.error("Facial enhancement failed:", error);
    throw new Error("Failed to enhance facial features.");
  }
}
