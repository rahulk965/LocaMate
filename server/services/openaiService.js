const OpenAI = require('openai');
const config = require('../config/config');

class OpenAIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
    this.model = config.openai.model;
    this.maxTokens = config.openai.maxTokens;
    this.temperature = config.openai.temperature;
  }

  // Process user chat message and generate contextual response
  async processChatMessage(message, userContext = {}, availablePlaces = []) {
    try {
      const systemPrompt = this.buildSystemPrompt(userContext);
      const userPrompt = this.buildUserPrompt(message, availablePlaces);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      const aiResponse = response.choices[0].message.content;
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('OpenAI chat error:', error);
      throw new Error('Failed to process chat message');
    }
  }

  // Generate micro-itinerary based on user preferences and context
  async generateItinerary(prompt, userPreferences = {}, location = null) {
    try {
      const systemPrompt = this.buildItinerarySystemPrompt(userPreferences);
      const userPrompt = this.buildItineraryPrompt(prompt, location);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      const aiResponse = response.choices[0].message.content;
      return this.parseItineraryResponse(aiResponse);
    } catch (error) {
      console.error('OpenAI itinerary error:', error);
      throw new Error('Failed to generate itinerary');
    }
  }

  // Extract intent and entities from user message
  async extractIntent(message) {
    try {
      const systemPrompt = `You are an intent extraction system. Analyze the user message and extract:
1. Intent (search, recommendation, question, itinerary, etc.)
2. Entities (location, cuisine, activity, time, mood, etc.)
3. Context (time of day, purpose, preferences, etc.)

Return the result as JSON with the following structure:
{
  "intent": "string",
  "entities": {
    "location": "string",
    "cuisine": "string",
    "activity": "string",
    "time": "string",
    "mood": "string",
    "purpose": "string"
  },
  "context": {
    "timeOfDay": "string",
    "urgency": "string",
    "groupSize": "number"
  }
}`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.1
      });

      const aiResponse = response.choices[0].message.content;
      return JSON.parse(aiResponse);
    } catch (error) {
      console.error('Intent extraction error:', error);
      return {
        intent: 'search',
        entities: {},
        context: {}
      };
    }
  }

  // Generate personalized recommendations
  async generateRecommendations(userPreferences, location, context = {}) {
    try {
      const systemPrompt = this.buildRecommendationSystemPrompt(userPreferences);
      const userPrompt = this.buildRecommendationPrompt(location, context);

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature
      });

      const aiResponse = response.choices[0].message.content;
      return this.parseRecommendationResponse(aiResponse);
    } catch (error) {
      console.error('OpenAI recommendation error:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  // Build system prompt for chat
  buildSystemPrompt(userContext) {
    return `You are LocaMate, an AI-powered travel and lifestyle companion. Your role is to help users find the perfect places based on their needs, preferences, and context.

User Context:
- Preferences: ${JSON.stringify(userContext.preferences || {})}
- Location: ${userContext.location || 'Not specified'}
- Previous interactions: ${userContext.history || 'None'}

Guidelines:
1. Be friendly, helpful, and conversational
2. Ask clarifying questions when needed
3. Provide specific, actionable recommendations
4. Consider time of day, weather, and context
5. Suggest places that match user's mood and purpose
6. Include relevant details like ratings, price, and atmosphere
7. Keep responses concise but informative

Available place categories: restaurants, cafes, bars, parks, museums, theaters, shopping, gyms, spas, hotels, etc.`;
  }

  // Build user prompt for chat
  buildUserPrompt(message, availablePlaces) {
    const placesInfo = availablePlaces.length > 0 
      ? `Available places in the area: ${availablePlaces.map(p => `${p.name} (${p.category})`).join(', ')}`
      : 'No specific places available yet.';

    return `User message: "${message}"

${placesInfo}

Please provide a helpful response that:
1. Addresses the user's request
2. Suggests relevant places if applicable
3. Asks follow-up questions if needed
4. Provides context-aware recommendations`;
  }

  // Build system prompt for itinerary generation
  buildItinerarySystemPrompt(userPreferences) {
    return `You are an expert travel planner creating personalized micro-itineraries. Consider the user's preferences and create engaging, realistic itineraries.

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Guidelines:
1. Create 2-4 place itineraries for 2-6 hours
2. Consider logical flow and travel time between places
3. Mix different types of activities
4. Include estimated duration for each place
5. Consider time of day and opening hours
6. Match user's mood and purpose
7. Provide brief descriptions for each place

Return the itinerary as JSON with this structure:
{
  "title": "string",
  "description": "string",
  "type": "morning|afternoon|evening|night|full-day",
  "mood": "relaxed|energetic|romantic|adventurous|social|productive|cultural",
  "purpose": "work|relax|explore|dine|nightlife|culture|shopping|outdoor",
  "places": [
    {
      "name": "string",
      "category": "string",
      "description": "string",
      "estimatedDuration": number,
      "notes": "string"
    }
  ],
  "totalDuration": number,
  "estimatedCost": number,
  "tags": ["string"]
}`;
  }

  // Build user prompt for itinerary generation
  buildItineraryPrompt(prompt, location) {
    return `Create a personalized itinerary based on this request: "${prompt}"

Location: ${location || 'Not specified'}

Please create an engaging itinerary that matches the user's request and preferences.`;
  }

  // Build system prompt for recommendations
  buildRecommendationSystemPrompt(userPreferences) {
    return `You are a personalized recommendation system. Based on user preferences and context, suggest the best places to visit.

User Preferences:
${JSON.stringify(userPreferences, null, 2)}

Guidelines:
1. Consider user's cuisine preferences, price range, and atmosphere preferences
2. Suggest places that match their activity interests
3. Consider time of day and current context
4. Provide diverse options
5. Include reasoning for each recommendation

Return recommendations as JSON with this structure:
{
  "recommendations": [
    {
      "place": "string",
      "category": "string",
      "reasoning": "string",
      "matchScore": number
    }
  ],
  "summary": "string"
}`;
  }

  // Build user prompt for recommendations
  buildRecommendationPrompt(location, context) {
    return `Generate personalized recommendations for location: ${location}

Context: ${JSON.stringify(context, null, 2)}

Please provide relevant recommendations based on the user's preferences and current context.`;
  }

  // Parse AI response for chat
  parseAIResponse(response) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        type: 'structured',
        data: parsed
      };
    } catch (error) {
      // Return as plain text
      return {
        type: 'text',
        data: {
          message: response,
          suggestions: this.extractSuggestions(response)
        }
      };
    }
  }

  // Parse AI response for itinerary
  parseItineraryResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        success: true,
        itinerary: parsed
      };
    } catch (error) {
      console.error('Failed to parse itinerary response:', error);
      return {
        success: false,
        error: 'Failed to generate itinerary'
      };
    }
  }

  // Parse AI response for recommendations
  parseRecommendationResponse(response) {
    try {
      const parsed = JSON.parse(response);
      return {
        success: true,
        recommendations: parsed
      };
    } catch (error) {
      console.error('Failed to parse recommendation response:', error);
      return {
        success: false,
        error: 'Failed to generate recommendations'
      };
    }
  }

  // Extract suggestions from text response
  extractSuggestions(text) {
    const suggestions = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        const suggestion = line.replace(/^[•\-\*]\s*/, '').trim();
        if (suggestion) suggestions.push(suggestion);
      }
    }
    
    return suggestions;
  }
}

module.exports = new OpenAIService(); 