import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPaperPlane, FaUser, FaStore } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import { getConversationMessages, getConversation, ChatWebSocket, sendMessage } from '../../services/chat';
import Spinner from '../../components/Spinner';

const SellerChat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial chat data
  useEffect(() => {
    const initializeChat = async () => {
      // Wait for auth to finish loading before checking user
      if (isLoading) return;
      
      if (!user || !conversationId) {
        toast.error('Invalid session or conversation.');
        navigate('/seller');
        return;
      }
      try {
        setLoading(true);
        const [conversationData, messagesData] = await Promise.all([
          getConversation(conversationId),
          getConversationMessages(conversationId)
        ]);
        console.log('SellerChat.jsx: Conversation data:', conversationData);
        console.log('SellerChat.jsx: Messages data:', messagesData);
        console.log('SellerChat.jsx: Current user ID:', user.id);
        console.log('SellerChat.jsx: Conversation seller ID:', conversationData?.sellerId);
        
        if (conversationData && conversationData.customer) {
            setCustomer(conversationData.customer);
        }
        setMessages(messagesData);
      } catch (error) {
        console.error('Error initializing chat:', error);
        toast.error('Failed to load chat data.');
        navigate('/seller');
      } finally {
        setLoading(false);
      }
    };
    initializeChat();
  }, [conversationId, user, navigate, isLoading]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!user || !conversationId) return;

    const chatSocket = new ChatWebSocket(user.id);
    setSocket(chatSocket);
    chatSocket.connect();
    chatSocket.joinConversation(conversationId);

    const unsubscribe = chatSocket.onMessage((receivedMessage) => {
      // Avoid adding duplicate messages if the server broadcasts back to the sender
      setMessages((prevMessages) => {
          if (prevMessages.some(msg => msg.id === receivedMessage.id)) {
              return prevMessages;
          }
          return [...prevMessages, receivedMessage];
      });
    });

    return () => {
      unsubscribe();
      chatSocket.disconnect();
    };
  }, [user, conversationId]);


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !socket) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    setSending(true);

    try {
      // First, save message to DB via REST API
      const savedMessage = await sendMessage(user.id, conversationId, messageContent);
      
      // Add the saved message to UI immediately
      setMessages((prev) => [...prev, savedMessage]);
      
      // Then notify other participants via WebSocket
      socket.sendMessage(savedMessage);
      
    } catch (error) {
      console.error('SellerChat.jsx: Error sending message:', error);
      toast.error('Failed to send message');
      // Restore the message in input if it failed
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/seller/chats')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {customer?.name || 'Customer'}
              </h2>
              <p className="text-sm text-gray-500">
                {customer?.email || ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          if (!message || !message.id) return null;
          const isOwnMessage = message.senderId === user?.id;
          const showDate = index === 0 || 
            formatDate(message.createdAt) !== formatDate(messages[index - 1]?.createdAt);

          return (
            <div key={message.id}>
              {showDate && (
                <div className="text-center text-xs text-gray-500 my-4">
                  {formatDate(message.createdAt)}
                </div>
              )}
              
              <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {!isOwnMessage && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="text-blue-600 text-sm" />
                    </div>
                  )}
                  
                  <div className={`px-4 py-2 rounded-lg ${
                    isOwnMessage 
                      ? 'bg-pink-600 text-white' 
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 text-right ${
                      isOwnMessage ? 'text-pink-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                  
                  {isOwnMessage && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaStore className="text-gray-600 text-sm" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              rows={1}
              disabled={sending}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending || !socket}
            className="p-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FaPaperPlane />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerChat; 