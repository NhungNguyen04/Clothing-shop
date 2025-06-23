import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaComment, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store/AuthStore'; // Import useAuthStore
import { getSellerConversations } from '../../services/chat';
import Spinner from '../../components/Spinner';
import AdminLayout from '../Admin/components/AdminLayout'; // Import AdminLayout

const SellerChats = () => {
  const navigate = useNavigate();
  const { user, seller } = useAuthStore(); // Get seller from the store
  
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
      
      // Ensure we have the seller object before fetching
      if (!seller || !seller.id) {
        toast.info('Loading seller information...');
        // The seller info should be loaded by AuthContext, but as a fallback:
        setLoading(false); // Stop loading as we can't proceed
        return;
      }

      try {
        setLoading(true);
        const conversationsData = await getSellerConversations(seller.id);
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [user, seller, navigate]);

  const filteredConversations = conversations.filter(conversation => {
    const customerName = conversation.user?.name || conversation.user?.email || '';
    const lastMessage = conversation.lastMessage?.content || '';
    const searchLower = searchTerm.toLowerCase();
    
    return customerName.toLowerCase().includes(searchLower) || 
           lastMessage.toLowerCase().includes(searchLower);
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  const ChatsContent = () => (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header is now part of AdminLayout */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Customer Conversations</h1>

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
        {loading ? (
          <div className="p-12 text-center">
            <Spinner />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-12">
            <FaComment className="mx-auto text-gray-400 text-4xl mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Customer conversations will appear here when they start chatting with you'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => navigate(`/seller/chat/${conversation.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Customer Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaUser className="text-blue-600" />
                    </div>
                  </div>

                  {/* Conversation Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {conversation.user?.name || conversation.user?.email || 'Unknown Customer'}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    
                    {conversation.lastMessage ? (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {truncateMessage(conversation.lastMessage.content)}
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

  return (
    <AdminLayout>
      <ChatsContent />
    </AdminLayout>
  );
};

export default SellerChats; 