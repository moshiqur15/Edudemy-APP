import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { messagingAPI } from '../services/api';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus,
  Users,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile,
  X,
  Check,
  CheckCheck,
  Clock,
  Minimize2,
  Maximize2
} from 'lucide-react';

export default function MessagingWidget() {
  const { user } = useAuth();
  const { sendMessage, messages: wsMessages } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen && !loading) {
      loadChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    }
  }, [selectedChat]);

  // Handle WebSocket messages
  useEffect(() => {
    if (wsMessages.length > 0) {
      const latestMessage = wsMessages[wsMessages.length - 1];
      if (selectedChat && latestMessage.group_id === selectedChat.id) {
        setMessages(prev => {
          if (prev.find(m => m.id === latestMessage.id)) return prev;
          return [...prev, latestMessage];
        });
      }
      // Update chat list with latest message
      setChats(prev => prev.map(chat => {
        if (chat.id === latestMessage.group_id) {
          return {
            ...chat,
            last_message: latestMessage.content,
            last_message_at: latestMessage.created_at,
            unread_count: chat.id === selectedChat?.id ? 0 : (chat.unread_count || 0) + 1
          };
        }
        return chat;
      }));
      
      // Update total unread count
      updateUnreadCount();
    }
  }, [wsMessages, selectedChat]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const chatsData = await messagingAPI.getChats();
      setChats(chatsData.results || chatsData);
      updateUnreadCount();
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      const messagesData = await messagingAPI.getMessages(chatId);
      setMessages(messagesData.results || messagesData);
      await messagingAPI.markAsRead(chatId);
      setChats(prev => prev.map(chat => 
        chat.id === chatId ? { ...chat, unread_count: 0 } : chat
      ));
      updateUnreadCount();
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const updateUnreadCount = () => {
    const total = chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
    setUnreadCount(total);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageData = {
      group_id: selectedChat.id,
      content: newMessage.trim()
    };

    try {
      const sentMessage = await messagingAPI.sendMessage(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      sendMessage(messageData);
      
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id 
          ? { 
              ...chat, 
              last_message: messageData.content,
              last_message_at: new Date().toISOString()
            }
          : chat
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
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
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const getMessageStatus = (message) => {
    if (message.sender_id !== user.id) return null;
    
    if (message.read_by && message.read_by.length > 1) {
      return <CheckCheck className="h-3 w-3 text-blue-600" />;
    } else if (message.delivered) {
      return <CheckCheck className="h-3 w-3 text-gray-400" />;
    } else {
      return <Check className="h-3 w-3 text-gray-400" />;
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants?.some(p => 
      p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        >
          <MessageCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle size={20} />
          <span className="font-medium">Messages</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-xs rounded-full px-2 py-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content */}
          <div className="flex-1 flex">
            {!selectedChat ? (
              /* Chat List */
              <div className="flex-1 flex flex-col">
                {/* Search */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-7 pr-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    <div className="p-2 space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredChats.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => setSelectedChat(chat)}
                          className="p-2 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              {chat.is_group ? (
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <Users className="h-4 w-4 text-purple-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {chat.name?.charAt(0).toUpperCase() || 
                                     chat.participants?.[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                              {chat.unread_count > 0 && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                  {chat.unread_count > 9 ? '9+' : chat.unread_count}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-medium text-gray-900 truncate">
                                  {chat.name || 
                                   chat.participants?.find(p => p.id !== user.id)?.full_name || 
                                   'Unknown User'}
                                </h4>
                                <span className="text-xs text-gray-500">
                                  {formatTime(chat.last_message_at || chat.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 truncate mt-0.5">
                                {chat.last_message || 'No messages yet'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-xs">No conversations found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-2 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ←
                    </button>
                    <div className="flex items-center space-x-2">
                      {selectedChat.is_group ? (
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <Users className="h-3 w-3 text-purple-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {selectedChat.name?.charAt(0).toUpperCase() || 
                             selectedChat.participants?.[0]?.full_name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {selectedChat.name || 
                           selectedChat.participants?.find(p => p.id !== user.id)?.full_name || 
                           'Unknown User'}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {messages.map((message, index) => {
                    const isOwn = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id || index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs ${isOwn ? 'order-1' : 'order-2'}`}>
                          <div
                            className={`px-2 py-1 rounded-lg text-xs ${
                              isOwn
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{message.content}</p>
                          </div>
                          <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.created_at)}
                            </span>
                            {getMessageStatus(message)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Message Input */}
                <div className="p-2 border-t bg-white">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className={`p-1 rounded transition-colors ${
                        newMessage.trim()
                          ? 'text-white bg-blue-600 hover:bg-blue-700'
                          : 'text-gray-400 bg-gray-100'
                      }`}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}