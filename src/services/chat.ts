import axiosInstance from './axiosInstance';
import { Seller } from './seller';
import { User } from './user';
import { io, Socket } from 'socket.io-client';

// Types for conversations and messages
export interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: Message;
  user: User;
  seller: Seller;
}

// Conversation related functions
export const createConversation = async (userId: string, sellerId: string): Promise<Conversation> => {
  try {
    const response = await axiosInstance.post(`/conversations`, { userId, sellerId });
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const getConversation = async (conversationId: string): Promise<Conversation> => {
  try {
    const response = await axiosInstance.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const response = await axiosInstance.get(`/conversations/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

export const getSellerConversations = async (sellerId: string): Promise<Conversation[]> => {
  try {
    const response = await axiosInstance.get(`/conversations/seller/${sellerId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting seller conversations:', error);
    throw error;
  }
};

// Message related functions
export const sendMessage = async (
  senderId: string, 
  conversationId: string, 
  content: string
): Promise<Message> => {
  try {
    const response = await axiosInstance.post(`/messages`, {
      senderId,
      conversationId,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessage = async (messageId: string): Promise<Message> => {
  try {
    const response = await axiosInstance.get(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
};

export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const response = await axiosInstance.get(`/messages/conversation/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    throw error;
  }
};

// Add this new function to fetch the last message
export const getLastMessage = async (conversationId: string): Promise<Message | null> => {
  try {
    const response = await axiosInstance.get(`/conversations/last-message/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting last message:', error);
    return null;
  }
};

// Get WebSocket base URL from the axiosInstance base URL
const getWebSocketUrl = () => {
  const baseUrl = axiosInstance.defaults.baseURL || '';
  // Replace http(s):// with ws(s)://
  return baseUrl.replace(/^http(s)?:\/\//, 'ws$1://') + '/chat';
};

// WebSocket implementation for real-time messaging
export class ChatWebSocket {
  private socket: Socket | null = null;
  private messageHandlers: ((message: Message) => void)[] = [];
  private currentConversationId: string | null = null;
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  connect(): void {
    const wsUrl = axiosInstance.defaults.baseURL?.replace(/^http(s)?:\/\//, '') || '';
    
    this.socket = io(`http://${wsUrl}`, { // Kết nối đến root namespace
      query: { userId: this.userId },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('ChatWebSocket: Socket.io connected');
      console.log('ChatWebSocket: Current conversation ID on connect:', this.currentConversationId);
      // Join conversation if we have one
      if (this.currentConversationId) {
        this.joinConversation(this.currentConversationId);
      }
    });

    // Lắng nghe sự kiện 'newMessage' từ server
    this.socket.on('newMessage', (message: Message) => {
      console.log('ChatWebSocket: Received newMessage event from server:', message);
      console.log('ChatWebSocket: Message structure:', {
        id: message.id,
        senderId: message.senderId,
        conversationId: message.conversationId,
        content: message.content,
        createdAt: message.createdAt
      });
      this.notifyHandlers(message);
    });

    this.socket.on('error', (error) => {
      console.error('Socket.io error:', error);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.io disconnected');
    });
  }

  joinConversation(conversationId: string): void {
    console.log(`ChatWebSocket: Attempting to join conversation room: ${conversationId}`);
    console.log(`ChatWebSocket: Socket connected? ${this.socket?.connected}`);
    
    if (!this.socket?.connected) {
      console.log('ChatWebSocket: Socket not connected, will join when connected');
      this.currentConversationId = conversationId;
      return;
    }
    
    console.log(`ChatWebSocket: Emitting joinConversation for: ${conversationId}`);
    this.socket.emit('joinConversation', conversationId);
    this.currentConversationId = conversationId;
    
    // Add listener for join confirmation
    this.socket.once('joinedConversation', (data) => {
      console.log('ChatWebSocket: Successfully joined conversation:', data);
    });
    
    this.socket.once('joinError', (error) => {
      console.error('ChatWebSocket: Failed to join conversation:', error);
    });
  }

  leaveConversation(conversationId: string): void {
    if (!this.socket?.connected) return;
    console.log(`Leaving conversation room: ${conversationId}`);
    this.socket.emit('leaveConversation', conversationId);
    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  // Gửi tin nhắn đến server, server sẽ lưu và phát lại cho mọi người trong phòng
  sendMessage(message: { conversationId: string; content: string }): void {
    if (!this.socket?.connected) {
      console.error('Cannot send message: Socket not connected');
      return;
    }
    
    const fullMessage = {
      ...message,
      senderId: this.userId,
    };
    
    console.log('ChatWebSocket: Emitting "sendMessage" with payload:', fullMessage);
    console.log('ChatWebSocket: Socket connected?', this.socket.connected);
    console.log('ChatWebSocket: Current conversation ID:', this.currentConversationId);
    
    this.socket.emit('sendMessage', fullMessage);
    
    // Add a listener for the response
    this.socket.once('messageSent', (response) => {
      console.log('ChatWebSocket: Server confirmed message sent:', response);
    });
    
    this.socket.once('messageError', (error) => {
      console.error('ChatWebSocket: Server returned error:', error);
    });
  }

  disconnect(): void {
    if (this.currentConversationId) {
      this.leaveConversation(this.currentConversationId);
    }
    this.socket?.disconnect();
    this.socket = null;
  }

  onMessage(handler: (message: Message) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  private notifyHandlers(message: Message): void {
    this.messageHandlers.forEach(handler => handler(message));
  }
}