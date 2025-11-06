# Quick Start Guide for Chat & Profile Features

## Step 1: Ensure Backend is Running

Make sure MongoDB is running and the backend server is started:

```bash
# Navigate to backend directory
cd backend

# Start the backend server
npm start
# OR
node server.js
```

The backend should be running on **http://localhost:5002**

## Step 2: Start Frontend

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend should be running on **http://localhost:5173**

## Step 3: Set Up Your Profile

1. Open your browser to http://localhost:5173
2. Log in (if required)
3. Click on **"Profile"** in the navigation bar
4. Click the **"Edit"** button
5. Enter your **Username** (Required for chat)
6. Optionally add:
   - Email (for syncing profile across devices)
   - Favorite Driver
   - Favorite Team
7. Click **"Save Changes"**

## Step 4: Use Live Chat

1. Click on **"Chat"** in the navigation bar
2. Type your message in the input box at the bottom
3. Click **"Send"** or press Enter
4. Your message will appear in the chat room
5. Messages from other users will appear automatically (refreshes every 2 seconds)

## Testing Chat with Multiple Users

To test the live chat functionality:

1. Open the app in one browser window
2. Set a username (e.g., "User1") in Profile
3. Go to Chat and send a message
4. Open the app in a different browser or incognito window
5. Set a different username (e.g., "User2")
6. Go to Chat - you should see User1's message
7. Send a message as User2 - both users will see it

## Troubleshooting

### Chat messages not appearing
- Check if backend is running on port 5002
- Check browser console for errors
- Ensure MongoDB is connected
- Verify username is set in Profile

### Profile not saving
- Check backend connection
- Look for error messages in the save confirmation
- Data is saved locally even if server is unavailable

### Navigation not working
- Clear browser cache
- Refresh the page
- Check that both Chat and Profile are in the navbar

## API Endpoints Used

- `GET /api/chat/rooms` - Get chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:roomId/messages` - Get messages
- `POST /api/chat/rooms/:roomId/messages` - Send message
- `POST /api/users` - Save user profile

## Features Overview

### Chat Features:
✅ Single global chat room
✅ Real-time message updates
✅ Username-based messaging
✅ Timestamp display
✅ Message history
✅ Auto-scroll to latest message
✅ Character limit (500 chars)

### Profile Features:
✅ Username management
✅ Email (optional)
✅ Favorite driver/team
✅ Profile summary dashboard
✅ Edit mode
✅ Save to localStorage
✅ Sync to MongoDB

## Next Steps

After setting up, you can:
- Customize your profile with your favorite driver and team
- Join the global F1 chat and connect with other fans
- View your profile summary
- Messages persist even after closing the browser

Enjoy TheGridLive! 🏎️💨
