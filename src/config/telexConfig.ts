const URL = 'https://2a86-197-211-58-209.ngrok-free.app'

export const telexConfig: {} = {
  "data": {
    "date": {
      "created_at": "2025-03-13",
      "updated_at": "2025-03-13"
    },
    "descriptions": {
      "app_description": "A service that crops and resizes user profile photos using face detection and returns the processed image URL.",
      "app_logo": "https://img.freepik.com/free-psd/3d-render-avatar-character_23-2150611759.jpg?t=st=1741830322~exp=1741833922~hmac=c6ecb1c74a4dde48124c80b093e08010357d4c8ecd536d470752ee0d0ba83973&w=740",
      "app_name": "Profile Icon Agent",
      "app_url": URL,
      "background_color": "#F5F5F5"
    },
    "integration_category": "AI & Machine Learning",
    "integration_type": "modifier",
    "is_active": true,
    "key_features": [
      "Uses AI for face detection.",
      "Crops and resizes images with padding for better profile photos.",
      "Uploads processed images to a cloud storage service.",
      "Returns a shareable URL for the cropped image."
    ],
    "permissions": {
      "monitoring_user": {
        "always_online": false,
        "display_name": "Profile Image Monitor"
      }
    },
    "settings": [
    ],
    "target_url": `${URL}/api/v1/target-url`
  }
};