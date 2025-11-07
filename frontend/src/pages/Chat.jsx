import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

export function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [username, setUsername] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const chatRoomId = 'global-f1-chat'; // Single global chatroom

  // Load username from localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('chatUsername');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Fetch messages from server
  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true);
      // First, ensure the global chat room exists
      const roomsResponse = await fetch(`${API_BASE_URL}/api/chat/rooms`);
      const rooms = await roomsResponse.json();
      
      let globalRoom = rooms.find(room => room.name === 'Global F1 Chat');
      
      if (!globalRoom) {
        // Create the global chat room
        const createResponse = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Global F1 Chat',
            description: 'Main chat room for all F1 fans',
            type: 'public',
            createdBy: 'system'
          })
        });
        globalRoom = await createResponse.json();
      }

      // Fetch messages from the global room
      const messagesResponse = await fetch(`${API_BASE_URL}/api/chat/rooms/${globalRoom._id}/messages`);
      const messagesData = await messagesResponse.json();
      
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom only when NEW messages are added (not on every fetch)
  useEffect(() => {
    // Only scroll if there are more messages than before
    if (messages.length > previousMessageCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      previousMessageCountRef.current = messages.length;
    } else if (messages.length === 0) {
      // Reset count when chat is empty
      previousMessageCountRef.current = 0;
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    if (!username) {
      alert('Please set your username in your profile first!');
      return;
    }

    try {
      // Get the global room ID
      const roomsResponse = await fetch(`${API_BASE_URL}/api/chat/rooms`);
      const rooms = await roomsResponse.json();
      const globalRoom = rooms.find(room => room.name === 'Global F1 Chat');

      if (!globalRoom) {
        alert('Chat room not available');
        return;
      }

      // Send message
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${globalRoom._id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: username, // Using username as userId for simplicity
          username: username,
          message: newMessage
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">F1 Live Chat</h1>
          </div>
          <p className="text-foreground/60 text-lg">
            Connect with F1 fans worldwide in real-time
          </p>
        </div>

        {/* Chat Container */}
        <div className="bg-card/50 backdrop-blur-lg rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-primary/20 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold text-foreground">Global F1 Chat</h2>
              </div>
              <div className="text-sm text-foreground/60">
                {messages.length} messages
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-background/30">
            {isLoadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-foreground/40">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOwnMessage = msg.username === username;
                return (
                  <div
                    key={index}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl p-4 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-primary/20'
                      }`}
                    >
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className={`font-bold text-sm ${
                          isOwnMessage ? 'text-primary-foreground' : 'text-primary'
                        }`}>
                          {msg.username}
                        </span>
                        <span className={`text-xs ${
                          isOwnMessage ? 'text-primary-foreground/70' : 'text-foreground/50'
                        }`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className={`text-sm break-words ${
                        isOwnMessage ? 'text-primary-foreground' : 'text-foreground'
                      }`}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-primary/20 p-4 bg-card/30">
            {!username ? (
              <div className="text-center py-4">
                <p className="text-foreground/60 mb-2">
                  Please set your username in your profile to start chatting
                </p>
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.hash = '#/profile';
                    }
                  }}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition"
                >
                  Go to Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-background border border-primary/20 rounded-xl text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  maxLength={500}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <p className="text-sm text-foreground/70 text-center">
            💬 Be respectful and follow community guidelines. This is a public chat room for all F1 fans.
          </p>
        </div>
      </div>
    </div>
  );
}
