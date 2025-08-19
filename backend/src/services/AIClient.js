import { GoogleGenerativeAI } from '@google/generative-ai';

export class AIClient {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use Gemini 2.0 Flash model as shown in your dashboard
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateResponse(systemPrompt, userMessage, conversationHistory = [], projectContext = '') {
    try {
      console.log('🤖 Calling Gemini 2.0 Flash API...');
      
      // Build conversation memory (last 2000 chars)
      let conversationMemory = this.buildConversationMemory(conversationHistory, 2000);
      
      // Enhanced system prompt with project context and memory
      let enhancedPrompt = `${systemPrompt}

PROJECT CONTEXT: ${projectContext || 'Multi-Agent Development Team working on various software features and improvements.'}

CONVERSATION MEMORY (Recent Discussion):
${conversationMemory}

IMPORTANT INSTRUCTIONS:
- Stay in character for your role
- Reference previous conversation when relevant
- Keep responses concise but helpful (max 150 words)
- If tagged directly (@YourRole), prioritize responding
- Build upon previous team discussions
- Be natural and conversational

Current message from human: "${userMessage}"

Respond as your character would, considering the full context above:`;

      console.log('📤 Sending prompt to Gemini API...');
      const result = await this.model.generateContent(enhancedPrompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Received response from Gemini API:', text.substring(0, 100) + '...');
      return text.trim();
    } catch (error) {
      console.error('❌ Gemini API Error:', error.message);
      
      // Try direct fetch approach using your dashboard format
      return await this.tryDirectAPICall(systemPrompt, userMessage, conversationHistory, projectContext);
    }
  }

  async tryDirectAPICall(systemPrompt, userMessage, conversationHistory = [], projectContext = '') {
    try {
      console.log('🔄 Trying direct API call to Gemini 2.0 Flash...');
      
      // Build conversation memory
      let conversationMemory = this.buildConversationMemory(conversationHistory, 2000);
      
      // Create the prompt exactly as shown in your dashboard format
      const promptText = `${systemPrompt}

PROJECT CONTEXT: ${projectContext || 'Multi-Agent Development Team working on various software features and improvements.'}

CONVERSATION MEMORY (Recent Discussion):
${conversationMemory}

IMPORTANT: Stay in character, be conversational, keep responses under 150 words.

Human message: "${userMessage}"

Your response:`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ]
      };

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': process.env.GEMINI_API_KEY
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const text = data.candidates[0].content.parts[0].text;
        console.log('✅ Direct API call successful:', text.substring(0, 100) + '...');
        return text.trim();
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('❌ Direct API call failed:', error.message);
      throw new Error('AI endpoint error');
    }
  }

  buildConversationMemory(history, maxChars = 2000) {
    if (!history || history.length === 0) return 'No previous conversation.';
    
    let memory = '';
    let currentLength = 0;
    
    // Start from most recent messages and work backwards
    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      const msgText = `${msg.author}: ${msg.content}\n`;
      
      if (currentLength + msgText.length > maxChars) {
        break;
      }
      
      memory = msgText + memory;
      currentLength += msgText.length;
    }
    
    return memory || 'No recent conversation.';
  }

  async generateCodeReview(code, prDescription) {
    try {
      const prompt = `You are a Senior Developer reviewing a pull request.

Pull Request Description: ${prDescription}

Code to review:
\`\`\`
${code}
\`\`\`

Please provide a constructive code review. Focus on:
- Code quality and best practices
- Potential bugs or issues
- Suggestions for improvement
- Whether you approve or request changes

Keep your review professional and helpful. End with either "APPROVED" or "REQUEST_CHANGES".`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        review: text.trim(),
        approved: text.toLowerCase().includes('approved')
      };
    } catch (error) {
      console.error('Error generating code review:', error);
      throw new Error('Failed to generate code review');
    }
  }
}
