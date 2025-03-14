import { Request, Response } from 'express';
import { extractImageUrl } from '../utils/extractImageUrl';
import { detectFaceWithPadding } from '../utils/faceDetection';
import { cropAndResizeImage } from '../utils/cropAndResizeImage';
import { uploadImageToCloudinary } from '../utils/saveToCloudinary';

export const targetUrlController = async (req: Request, res: Response): Promise<void> => {
  const { message, settings } = req.body;
  const returnUrl = `https://ping.telex.im/v1/webhooks/01958f9f-fd87-777f-b4ec-cba30f76d81c`
  try {
    // Handle "/help" command
    if (message.toLowerCase().includes("/help")) {
      const helpMessage = `To use this agent, send "/image <url>" to crop and resize the image.`;
      res.status(200).json({ message: helpMessage });
      return;
    }

    // Handle "/image" command
    const imageUrl = extractImageUrl(message);
    if (imageUrl) {
      // Process image
      const faceData = await detectFaceWithPadding(imageUrl);
      const croppedImageBuffer = await cropAndResizeImage(imageUrl, faceData);
      const uploadedUrl = await uploadImageToCloudinary(croppedImageBuffer);

      // Return the modified message with the processed image URL
      const modifiedMessage = `Image successfully processed: ${uploadedUrl}`;
      res.status(200).json({ message: modifiedMessage });
      return;
    }

    // If no valid command, return the original message
    res.status(200).json({ message: "Invalid command or URL" });
  } catch (error: any) {
    res.status(500).json({ message: `Error processing message: ${error.message}` });
  }
};
