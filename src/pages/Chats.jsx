import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStore, FaComment, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { getUserConversations, getLastMessage } from '../services/chat';
import Spinner from '../components/Spinner';

const Chats = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadConversations = async () => {
      if (!user) {
        toast.error('You must be logged in to view conversations');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const conversationsData = await getUserConversations(user.id);
        // Fetch last message for each conversation in parallel
        const conversationsWithLastMessage = await Promise.all(
          conversationsData.map(async (conv) => {
            const lastMessage = await getLastMessage(conv.id);
            return { ...conv, lastMessage };
          })
        );
        setConversations(conversationsWithLastMessage);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, navigate]);

  const filteredConversations = conversations.filter(conversation => {
    const sellerName = conversation.seller?.managerName || '';
    const lastMessage = conversation.lastMessage?.content || '';
    const searchLower = searchTerm.toLowerCase();
    
    return sellerName.toLowerCase().includes(searchLower) || 
           lastMessage.toLowerCase().includes(searchLower);
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">My Conversations</h1>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <FaComment className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Start chatting with sellers to see your conversations here'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate('/collection')}
                className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
              >
                Browse Products
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => navigate(`/chat/${conversation.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Seller Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                      <FaStore className="text-pink-600" />
                    </div>
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.seller?.managerName || 'Unknown Seller'}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage ? (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {conversation.lastMessage.senderId === user?.id
                          ? `Tôi: ${truncateMessage(conversation.lastMessage.content)}`
                          : truncateMessage(conversation.lastMessage.content)
                        }
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-1">
                        No messages yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats; 