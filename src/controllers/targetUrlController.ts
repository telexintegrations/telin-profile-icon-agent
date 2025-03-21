import { Request, Response } from "express";
import { extractImageUrl } from "../utils/extractImageUrl";
import { detectFaceWithPadding } from "../utils/faceDetection";
import { cropAndResizeImage } from "../utils/cropAndResizeImage";
import { uploadImageToCloudinary } from "../utils/saveToCloudinary";
import { extractChannelId } from "../utils/extractChannelSettings";
import { stylePresets } from "../utils/styles";
import { enhanceImageQuality } from "../utils/imageEnhancer";
import { removeBackground } from "../utils/backgroundRemover";
import { enhanceFacialFeatures } from "../utils/facialEnhancer";

const webhookUrl = `https://ping.telex.im/v1/webhooks/`;

export const targetUrlController = async (req: Request, res: Response): Promise<void> => {
  const { message, style, enableBgRemoval = false, enableFaceEnhance = false } = req.body;

  console.log("Received message:", message);

  const channelId = extractChannelId(req.body);
  const returnUrl = `${webhookUrl}${channelId}`;

  try {
    // Handle "/help" command
    if (message.toLowerCase().includes("/help")) {
      const helpMessage = `To use this agent, send "/image <url>" to crop and resize the image.`;
      res.status(200).json({ message: helpMessage });
      return;
    }

    // Handle "/image" command
    const imageUrl = extractImageUrl(message);

    if (!imageUrl) {
      res.status(400).json({ message: "Invalid image URL" });
      return;
    }

    console.log("Processing image:", imageUrl);

    // Detect face with padding
    const faceData = await detectFaceWithPadding(imageUrl);

    let croppedImageBuffer;

    // Apply style only if provided
    if (style && style in stylePresets) {
      const selectedStyle = stylePresets[style as keyof typeof stylePresets];
      croppedImageBuffer = await cropAndResizeImage(imageUrl, faceData, selectedStyle);
    } else {
      console.log("No style selected, using default cropping.");
      croppedImageBuffer = await cropAndResizeImage(imageUrl, faceData, null); // Modify function to handle `null` styles
    }

    // Optional background removal
    if (enableBgRemoval) {
      console.log("Removing background...");
      croppedImageBuffer = await removeBackground(imageUrl);
    }

    // Optional facial enhancement
    if (enableFaceEnhance) {
      console.log("Enhancing facial features...");
      croppedImageBuffer = await enhanceFacialFeatures(croppedImageBuffer);
    }

    // Always enhance image quality
    croppedImageBuffer = await enhanceImageQuality(croppedImageBuffer);

    // Upload to Cloudinary
    const uploadedUrl = await uploadImageToCloudinary(croppedImageBuffer);

    // Prepare data to send back to Telex
    const data = {
      event_name: "image_processed",
      message: `Image successfully processed: ${uploadedUrl}`,
      status: "success",
      username: "Profile Icon Agent",
    };

    console.log("Sending request to Telex:", returnUrl);

    // Send the response to Telex return URL
    const telexResponse = await fetch(returnUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Telex response status:", telexResponse.status);

    if (!telexResponse.ok) {
      const errorText = await telexResponse.text();
      throw new Error(`Telex webhook POST request failed with status ${telexResponse.status}: ${errorText}`);
    }

    console.log("Final Payload Sent to Telex:", JSON.stringify(data, null, 2));

    // Send success response to client
    res.status(200).json({ message: `Success`, processedImage: uploadedUrl });
  } catch (error: any) {
    console.error("Error:", error.message);

    if (!res.headersSent) {
      res.status(500).json({ message: `Error processing message: ${error.message}` });
    }
  }
};
