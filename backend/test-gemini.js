import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Google Gemini 2.0 Flash API connection...');
    console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const prompt = "Hello, just say 'Hi there!' in response to test the API.";
    
    console.log('📤 Sending test prompt:', prompt);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API Response received:', text);
    return text;
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.error('Full error:', error);
    
    // Try direct API call
    console.log('🔄 Trying direct API call...');
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Hello, just say 'Hi there!' in response to test the API."
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        console.log('✅ Direct API call successful:', text);
        return text;
      } else {
        console.error('❌ Direct API call failed:', response.status, response.statusText);
        return null;
      }
    } catch (directError) {
      console.error('❌ Direct API call error:', directError.message);
      return null;
    }
  }
}

testGeminiAPI().then(result => {
  if (result) {
    console.log('🎉 Gemini API is working correctly!');
  } else {
    console.log('💥 Gemini API test failed');
  }
  process.exit(0);
});
