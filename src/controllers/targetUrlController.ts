import { Request, Response } from 'express';
import { extractImageUrl } from '../utils/extractImageUrl';
import { detectFaceWithPadding } from '../utils/faceDetection';
import { cropAndResizeImage } from '../utils/cropAndResizeImage';
import { uploadImageToCloudinary } from '../utils/saveToCloudinary';
import { extractChannelId } from '../utils/extractChannelSettings';

const webhookUrl = `https://ping.telex.im/v1/webhooks/`;

export const targetUrlController = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;

  console.log(message);

  const channelId = extractChannelId(req.body); // Extract channel_id from settings
  const returnUrl = `${webhookUrl}${channelId}`;

  try {
    // Handle "/help" command
    if (message.toLowerCase().includes("/help")) {
      const helpMessage = `To use this agent, send "/image 'image url'" to crop and resize the image.`;
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

      // Prepare data to send back to Telex
      const data = {
        event_name: 'image_processed',
        message: `Image successfully processed: ${uploadedUrl}`,
        status: 'success',
        username: 'Profile Icon Agent',
      };

      // Send the response to Telex return URL
      const telexResponse = await fetch(returnUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!telexResponse.ok) {
        throw new Error(`Telex webhook POST request failed with status: ${telexResponse.status}`);
      }

      // Send success response to client
      res.status(200).json({ message: `Success` });
      return; // Ensure no further code runs after success
    }

    // If no valid command, return a default response
    res.status(400).json({ message: "Invalid command or URL" });
  } catch (error: any) {
    if (!res.headersSent) {
      res.status(500).json({ message: `Error processing message: ${error.message}` });
    } else {
      console.error('Error after headers were already sent:', error.message);
    }
  }
};
