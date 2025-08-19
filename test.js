/**
 * A simple script to test the Google Gemini API endpoint.
 * This script uses the `fetch` API and is intended to be run
 * in a Node.js environment.
 */

// Replace this with your actual API key. It's best practice
// to store API keys in environment variables, but for a
// simple test, you can place it here.
const GEMINI_API_KEY = "AIzaSyBvu-QMZS_sp9f8RyAScGmlBFWdtJUOAkM";

const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * The payload for the API request. This object specifies the content
 * to be sent to the model.
 */
const payload = {
  "contents": [
    {
      "parts": [
        {
          "text": "Explain how AI works in a few words"
        }
      ]
    }
  ]
};

async function testGeminiAPI() {
  console.log("Making a request to the Gemini API...");
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Log the entire JSON response for inspection
    console.log("--- API Response ---");
    console.log(JSON.stringify(result, null, 2));

    // Extract and log the generated text
    const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (generatedText) {
      console.log("--- Generated Text ---");
      console.log(generatedText);
    } else {
      console.log("No generated text found in the response.");
    }

  } catch (error) {
    console.error("An error occurred while testing the API:", error);
  }
}

// Execute the function
testGeminiAPI();
