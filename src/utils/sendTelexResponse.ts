import fetch from 'node-fetch'; // Make sure to install node-fetch if not already

// Helper function to send a response back to Telex
export async function sendTelexResponse(returnUrl: string, message: string, eventName: string, username: string): Promise<void> {
    // Prepare the data that needs to be sent to the Telex channel
    const data = {
        event_name: eventName,   // The event name, e.g., "image_processed" or "style_selection"
        message: message,        // The message content, e.g., "Image successfully processed: <URL>"
        status: 'success',       // Status of the action
        username: username,      // Username of the agent, e.g., "Profile Icon Agent"
    };

    // Send the POST request to the Telex webhook URL
    const telexResponse = await fetch(returnUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),  // Convert the message data to JSON
    });

    // Check if the request to Telex was successful
    if (!telexResponse.ok) {
        // If not, throw an error with the status code for debugging purposes
        throw new Error(`Telex webhook POST request failed with status: ${telexResponse.status}`);
    }

    // Parse and log the response data from Telex
    const telexResponseData = await telexResponse.json();
    console.log('Telex Response:', telexResponseData);
}
