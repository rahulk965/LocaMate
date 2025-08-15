# LocaMate - AI-Powered Travel & Lifestyle Companion

LocaMate is an intelligent travel and lifestyle companion that delivers personalized, context-aware recommendations using natural language conversations and the Foursquare Places API.

## 🌟 Features

- **Conversational AI Interface**: Natural chat-based interaction for place recommendations
- **Smart Nearby Search**: Dynamic place discovery based on mood, preferences, and context
- **Context-Aware Recommendations**: Adapts to time of day, purpose, and current situation
- **Rich Place Details**: Comprehensive information including contact details and directions
- **Instant Micro-Itineraries**: AI-generated personalized short itineraries
- **Modern UI/UX**: Beautiful, responsive interface with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Foursquare API key
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LocaMate
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` files in both `server/` and `client/` directories:
   
   **Server (.env)**
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   FOURSQUARE_API_KEY=your_foursquare_api_key
   OPENAI_API_KEY=your_openai_api_key
   NODE_ENV=development
   ```
   
   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend client (port 3000).

## 🏗️ Project Structure

```
LocaMate/
├── client/          # React.js Frontend
├── server/          # Node.js/Express Backend
├── package.json     # Root package.json
└── README.md
```

### Frontend (React.js)
- Modern UI with TailwindCSS and Framer Motion
- Conversational chat interface
- Responsive design for mobile and desktop
- Real-time place recommendations

### Backend (Node.js/Express)
- RESTful API endpoints
- Foursquare Places API integration
- OpenAI GPT integration for natural language processing
- User authentication and data management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Places
- `GET /api/places/search` - Search nearby places
- `GET /api/places/:id` - Get place details
- `POST /api/places/favorite` - Add to favorites

### Chat & Recommendations
- `POST /api/chat/conversation` - Process chat messages
- `GET /api/recommendations` - Get personalized recommendations

### Itineraries
- `POST /api/itineraries/generate` - Generate micro-itinerary
- `GET /api/itineraries` - Get user itineraries

## 🎯 Usage Examples

### Chat Interface
- "Find me a quiet cafe nearby to work for 2 hours"
- "I'm in the mood for Italian food, what's good around here?"
- "Show me places to explore in this area"

### Context-Aware Features
- Time-based recommendations (breakfast, lunch, dinner, late-night)
- Purpose-specific suggestions (work, relax, explore, dine, nightlife)
- Mood-based filtering (quiet, vibrant, romantic, family-friendly)

## 🛠️ Tech Stack

### Frontend
- React.js 18
- TailwindCSS
- Framer Motion
- Axios for API calls
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- OpenAI GPT API
- Foursquare Places API

## 📱 Mobile Responsive

The application is fully responsive and optimized for mobile devices, providing a seamless experience across all screen sizes.

## 🔒 Security

- JWT-based authentication
- Input validation and sanitization
- Secure API key management
- CORS configuration
- Rate limiting

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
```

### Backend (Heroku/Railway)
```bash
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team. 