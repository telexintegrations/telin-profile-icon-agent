import { Request, Response } from 'express';
import axios from 'axios';
import { extractImageUrl } from '../utils/extractImageUrl';
import { detectFaceWithPadding } from '../utils/faceDetection';
import { cropAndResizeImage } from '../utils/cropAndResizeImage';
import { uploadImageToCloudinary } from '../utils/saveToCloudinary';

export const targetUrlController = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;
  console.log(req.body);

  const returnUrl = `https://ping.telex.im/v1/webhooks/01958f9f-fd87-777f-b4ec-cba30f76d81c`
  try {
    const imageUrl = extractImageUrl(message);
    console.log(imageUrl);

    if (!imageUrl) {
      res.status(400).json({ error: 'Invalid message format or URL' });
      return
    }

    // Detect face and crop the image
    const faceData = await detectFaceWithPadding(imageUrl);
    const croppedImageBuffer = await cropAndResizeImage(imageUrl, faceData);

    // Upload cropped image to Cloudinary
    const uploadedUrl = await uploadImageToCloudinary(croppedImageBuffer);

    const data = {
      event_name: 'image_processed',
      message: `Image successfully processed: ${uploadedUrl}`,
      status: 'success',
      username: 'Profile Icon Agent',
    }

    // Return the Cloudinary URL to the Telex return URL
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
    const telexResponseData = await telexResponse.json();
    console.log('Telex Response:', telexResponseData);

    res.status(200).json({
      message: `Success`,
    });
    console.log(uploadedUrl);

  } catch (error: any) {
    res.status(500).json({ error: `Failed to process image: ${error.message}` });
  }
} 