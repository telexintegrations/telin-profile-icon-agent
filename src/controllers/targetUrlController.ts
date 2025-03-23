import { Request, Response } from 'express';
import { extractImageUrl } from '../utils/extractImageUrl';
import { detectFaceWithPadding } from '../utils/faceDetection';
import { cropAndResizeImage } from '../utils/cropAndResizeImage';
import { uploadImageToCloudinary } from '../utils/saveToCloudinary';
import { extractChannelId } from '../utils/extractChannelSettings';
import { sendTelexResponse } from '../utils/sendTelexResponse';
import { enhanceFacialFeatures } from '../utils/facialEnhancer';
import { removeBackground } from '../utils/backgroundRemover';
import { parse } from 'node-html-parser';

const webhookUrl = `https://ping.telex.im/v1/webhooks/`;

// In-memory state management
let userState: { [channelId: string]: any } = {};

export const targetUrlController = async (req: Request, res: Response): Promise<void> => {
  const { message } = req.body;
  console.log(message);

  const channelId = extractChannelId(req.body);
  const returnUrl = `${webhookUrl}${channelId}`;

  if (!channelId) {
    res.status(400).json({ message: "Invalid channel ID" });
    return;
  }

  // Initialize the user state if it doesn't exist
  if (!userState[channelId]) {
    userState[channelId] = { stage: 'awaiting_image' };
  }

  try {
    const userStage = userState[channelId].stage;

    // Stage 1: Handle initial image upload
    if (userStage === 'awaiting_image') {
      const imageUrl = extractImageUrl(message);
      if (imageUrl) {
        // Store the image URL and ask for style
        userState[channelId] = { ...userState[channelId], imageUrl, stage: 'awaiting_style' };

        const styleMessage = `🎉 Great! Your image has been received. Please choose a style for your profile icon: "Cool", "Professional", "Artistic", "Retro", "Vibrant", "Cinematic" or "None".`;
        await sendTelexResponse(returnUrl, styleMessage, 'style_request', 'Profile Icon Agent');
        res.status(200).json({ message: message });
        return;
      } else {
        res.status(400).json({ message: "Invalid image URL format. Please send a valid image." });
        return;
      }
    }

    // Stage 2: Handle style selection
    if (userStage === 'awaiting_style') {
      const parsedMessage = parse(message);
      const style = parsedMessage.text.trim().toLowerCase();
      if (["cool", "professional", "artistic", "retro", "vibrant", "cinematic"].includes(style)) {
        userState[channelId] = { ...userState[channelId], style, stage: 'awaiting_enhancement' };

        const enhancementMessage = `👌 You selected "${style}". Would you like to enhance the image further for more sharpness and clarity? (yes/no)`;
        await sendTelexResponse(returnUrl, enhancementMessage, 'enhancement_request', 'Profile Icon Agent');
        res.status(200).json({ message: parsedMessage });
        return;
      } else {
        res.status(200).json({ message: "Invalid style. Please choose 'Cool', 'Professional', 'Artistic', 'Retro', 'Vibrant', or 'cinematic'." });
        return;
      }
    }

    // Stage 3: Handle enhancement decision
    if (userStage === 'awaiting_enhancement') {
      const parsedMessage = parse(message);
      const enhancementDecision = parsedMessage.text.trim().toLowerCase();
      if (["yes", "no"].includes(enhancementDecision)) {
        userState[channelId] = { ...userState[channelId], enhancement: enhancementDecision === 'yes', stage: 'awaiting_background' };

        const backgroundMessage = `✨ Would you like to remove the background for a cleaner look? (yes/no)`;
        await sendTelexResponse(returnUrl, backgroundMessage, 'background_request', 'Profile Icon Agent');
        res.status(200).json({ message: parsedMessage });
        return;
      } else {
        res.status(400).json({ message: "Please respond with 'yes' or 'no'." });
        return;
      }
    }

    // Stage 4: Final processing with user decisions
    if (userStage === 'awaiting_background') {
      const parsedMessage = parse(message)
      const backgroundDecision = parsedMessage.text.trim().toLowerCase();
      if (["yes", "no"].includes(backgroundDecision)) {
        const { imageUrl, style, enhancement } = userState[channelId];
        userState[channelId] = { ...userState[channelId], background: backgroundDecision === 'yes' };

        // Process the image
        const faceData = await detectFaceWithPadding(imageUrl);
        if (!faceData.coordinates || Object.keys(faceData.coordinates).length === 0) {
          const errorMessage = `😞 Unfortunately, we couldn't detect a face in the image. Please upload a clearer image where your face is visible.`;
          await sendTelexResponse(returnUrl, errorMessage, 'error', 'Profile Icon Agent');
          return
        }
        let croppedImageBuffer = await cropAndResizeImage(imageUrl, faceData, style);
        if (enhancement) {
          croppedImageBuffer = await enhanceFacialFeatures(croppedImageBuffer);
        }
        // Apply background removal if requested
        if (backgroundDecision === 'yes') {
          croppedImageBuffer = await removeBackground(croppedImageBuffer);
        }
        const uploadedUrl = await uploadImageToCloudinary(croppedImageBuffer);

        const successMessage = `🚀 All done! Your profile icon has been processed with the "${style}" style. You can view it here: ${uploadedUrl}`;
        await sendTelexResponse(returnUrl, successMessage, 'image_processed', 'Profile Icon Agent');

        // Clean up user session after processing is complete
        delete userState[channelId];

        res.status(200).json({ message: 'Image successfully processed.' });
      } else {
        res.status(400).json({ message: "Please respond with 'yes' or 'no'." });
      }
    }
  } catch (error: any) {
    res.status(500).json({ message: `Error processing message: ${error.message}` });
  }
};
