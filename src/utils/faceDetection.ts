import axios from "axios";
import dotenv from 'dotenv'

dotenv.config()
// Function to detect face using Imagga API and return adjusted cropping data with padding
export async function detectFaceWithPadding(photoUrl: string, padding: number = 100) {
  const apiKey = process.env.IMAGGA_API_KEY;
  const apiSecret = process.env.IMAGGA_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('IMAGGA_API_KEY or IMAGGA_API_SECRET is not defined in the environment variables');
  }

  const apiUrl = `https://api.imagga.com/v2/faces/detections?image_url=${encodeURIComponent(photoUrl)}`;

  const response = await axios.get(apiUrl, {
    auth: {
      username: apiKey,
      password: apiSecret,
    },
  });

  const faces = response.data.result.faces;

  // Log the response from Imagga for debugging
  console.log('Imagga API Face Detection Response:', faces);

  if (!faces || faces.length === 0) {
    throw new Error('No face detected in the image');
  }

  // Assume the first face detection result is the one we need
  const face = faces[0];
  const { coordinates } = face;

  // Validate the bounding box coordinates
  if (
    coordinates.xmin === undefined || coordinates.ymin === undefined ||
    coordinates.xmax === undefined || coordinates.ymax === undefined
  ) {
    throw new Error('Invalid face detection coordinates received from Imagga');
  }

  return { coordinates, padding };
}