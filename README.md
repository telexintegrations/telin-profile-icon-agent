# Profile Icon Agent

## Overview
Profile Icon Agent is an AI-powered service that automatically detects faces in images, crops and resizes them with proper padding, and returns a processed image URL. The service integrates with Telex to send processed image notifications.

## Features
- Uses AI for face detection via Imagga API.
- Crops and resizes images with padding for optimal profile photos.
- Uploads processed images to Cloudinary.
- Returns a shareable URL for the cropped image.
- Integrates with Telex for notifications.

## Technologies Used
- **Node.js** (Express.js)
- **TypeScript**
- **Cloudinary** (Image Storage)
- **Imagga API** (Face Detection)
- **Telex** (Messaging & Notification Service)
- **Sharp** (Image Processing)
- **Axios** (HTTP Requests)
- **Dotenv** (Environment Variables)

## Installation
### Prerequisites
- Node.js installed
- Cloudinary account (for image storage)
- Imagga API credentials (for face detection)
- Ngrok (if testing locally with Telex webhook)

### Steps
1. Clone the repository:
   ```sh
   git clone https://github.com/telexintegrations/telin-profile-icon-agent.git
   cd profile-icon-agent
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and add the following:
   ```env
   PORT=3000
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   IMAGGA_API_KEY=your_imagga_api_key
   IMAGGA_API_SECRET=your_imagga_api_secret
   ```
4. Start the server:
   ```sh
   npm run dev
   ```

## API Endpoints
### 1. Get Integration Config
**Endpoint:** `GET /api/v1/integration-config`

**Response:**
```json
{
  "app_name": "Profile Icon Agent",
  "app_description": "A service that crops and resizes user profile photos using face detection and returns the processed image URL."
}
```

### 2. Process Image (Webhook)
**Endpoint:** `POST /api/v1/target-url`

**Request Body:**
```json
{
  "message": "/image https://example.com/sample.jpg"
}
```

**Response:**
```json
{
  "message": "Success"
}
```

## How It Works
1. A user sends an image URL with the `/image` command.
2. The service extracts the image URL.
3. Imagga API detects faces in the image.
4. The image is cropped and resized with padding.
5. The processed image is uploaded to Cloudinary.
6. A response with the processed image URL is sent to Telex.

## Error Handling
- Invalid or missing image URLs return `400 Bad Request`.
- If no face is detected, the response includes an error message.
- Failed Cloudinary uploads return `500 Internal Server Error`.

## Contribution
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit changes (`git commit -m "Add new feature"`).
4. Push to branch (`git push origin feature-branch`).
5. Open a Pull Request.

## License
This project is licensed under the MIT License.

## Contact
For any questions or contributions, reach out to [mailto:jjoshuadomfa@gmail.com](mailto:jjoshuadomfa@gmail.com) or [mailto:estheradexdainty@gmail.com](mailto:estheradexdainty@gmail.com).

