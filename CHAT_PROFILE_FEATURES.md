# Chat and Profile Features

## Overview
Two new features have been added to TheGridLive:

1. **Live Chat** - Real-time chat room for F1 fans
2. **User Profile** - Personal profile management

## Features

### 🗨️ Live Chat (`/chat`)
- **Single Global Chat Room** for all F1 fans
- **Real-time messaging** with auto-refresh every 2 seconds
- **Username-based identification** (set in Profile)
- **Message history** stored in MongoDB
- **Timestamp display** showing relative time (e.g., "5m ago")
- **Responsive design** with message bubbles
- **Character limit** of 500 characters per message
- **Community guidelines** banner

**Usage:**
1. Set your username in Profile first
2. Navigate to Chat page
3. Type your message and click Send
4. Messages appear instantly for all users

### 👤 User Profile (`/profile`)
- **Username** (Required for chat)
- **Email** (Optional - for syncing across devices)
- **Favorite Driver** (Optional)
- **Favorite Team** (Optional)
- **Profile Summary** dashboard
- **Local & Server Storage** (localStorage + MongoDB)

**Usage:**
1. Navigate to Profile page
2. Click "Edit" button
3. Enter your details
4. Click "Save Changes"
5. Profile is saved locally and to server (if email provided)

## Technical Implementation

### Frontend Components
- `frontend/src/pages/Chat.jsx` - Live chat interface
- `frontend/src/pages/Profile.jsx` - User profile management

### Backend API Endpoints
- `GET /api/chat/rooms` - Get all chat rooms
- `POST /api/chat/rooms` - Create new chat room
- `GET /api/chat/rooms/:roomId/messages` - Get messages for a room
- `POST /api/chat/rooms/:roomId/messages` - Send message to a room
- `GET /api/users/:email` - Get user profile
- `POST /api/users` - Create/update user profile
- `PUT /api/users/:email/status` - Update user online status

### Database Models
- `backend/models/ChatRoom.js` - Chat room and message schema
- `backend/models/User.js` - User profile schema

### Storage Strategy
- **localStorage**: Username, email, favorite driver/team (for quick access)
- **MongoDB**: Full user profile and chat messages (for persistence)

## Navigation
- Chat and Profile links added to the main navbar
- Mobile-responsive menu includes both new pages

## How It Works

### Chat Flow:
1. User sets username in Profile → Stored in localStorage
2. User navigates to Chat
3. Frontend fetches existing messages from MongoDB
4. User types message → Sent to backend API
5. Backend saves message to MongoDB ChatRoom
6. Auto-refresh fetches new messages every 2s
7. All users see the message

### Profile Flow:
1. User enters profile information
2. Data saved to localStorage (immediate)
3. If email provided, data also saved to MongoDB
4. Username is used across the app (especially in Chat)

## Prerequisites
- MongoDB connection (backend/server.js)
- Backend server running on port 5002
- Frontend running with API calls to http://localhost:5002

## Future Enhancements
- Real-time WebSocket connections for instant messages
- Multiple chat rooms (race-specific, team-specific)
- User avatars and profile pictures
- Message reactions and replies
- Online user count
- Private messaging
- Message search and filtering
- Admin moderation tools

## Testing
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Navigate to http://localhost:5173
4. Go to Profile, set username
5. Go to Chat, send a message
6. Open in another browser/tab to see live chat in action

## Notes
- Username is required for chat functionality
- Messages are public and visible to all users
- No authentication required (uses username for identification)
- Messages persist across sessions (stored in MongoDB)
- Profile data syncs to server only if email is provided
