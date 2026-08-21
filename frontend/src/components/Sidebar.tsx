import React, { useState } from 'react';
import { Chat } from '../types';
import { MessageSquarePlus } from 'lucide-react';

interface Props {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: (phoneNumber: string, webhookUrl: string, accessToken: string) => void;
}

export const Sidebar: React.FC<Props> = ({ chats, activeChatId, onSelectChat, onNewChat }) => {
  const [search, setSearch] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [newWebhookUrl, setNewWebhookUrl] = useState('http://localhost:8000/api/whatsapp/webhook');
  const [newAccessToken, setNewAccessToken] = useState('mock_access_token_secret');

  const filtered = chats.filter(c => 
    c.contact?.phoneNumber.includes(search) || 
    c.contact?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (newPhone && newWebhookUrl && newAccessToken) {
      onNewChat(newPhone, newWebhookUrl, newAccessToken);
      setNewPhone('');
      setShowNewChat(false);
    }
  };

  return (
    <div className="w-1/3 max-w-[400px] bg-white border-r flex flex-col">
      <div className="p-3 bg-[#f0f2f5] flex justify-between items-center">
        <h2 className="font-bold text-gray-700">Chats</h2>
        <button onClick={() => setShowNewChat(true)} className="p-2 text-gray-600 hover:bg-gray-200 rounded-full">
          <MessageSquarePlus size={20} />
        </button>
      </div>

      {showNewChat && (
        <div className="p-3 border-b bg-white">
          <input 
            type="text" 
            placeholder="Enter phone number" 
            className="w-full p-2 border rounded text-sm mb-2"
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Webhook URL" 
            className="w-full p-2 border rounded text-sm mb-2"
            value={newWebhookUrl}
            onChange={e => setNewWebhookUrl(e.target.value)}
          />
          <input 
            type="text" 
            placeholder="Access Token" 
            className="w-full p-2 border rounded text-sm mb-2"
            value={newAccessToken}
            onChange={e => setNewAccessToken(e.target.value)}
          />
          <div className="flex gap-2">
            <button onClick={handleCreate} className="flex-1 bg-green-500 text-white rounded py-1 text-sm">Create</button>
            <button onClick={() => setShowNewChat(false)} className="flex-1 border rounded py-1 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="p-2 border-b">
        <input 
          type="text" 
          placeholder="Search chats..." 
          className="w-full p-2 bg-[#f0f2f5] rounded-lg text-sm outline-none"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(chat => (
          <div 
            key={chat.id} 
            onClick={() => onSelectChat(chat.id)}
            className={`flex items-center p-3 cursor-pointer hover:bg-[#f5f6f6] border-b ${activeChatId === chat.id ? 'bg-[#f0f2f5]' : ''}`}
          >
            <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white font-bold mr-3">
              {chat.contact?.name?.[0]?.toUpperCase() || '#'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-medium text-gray-900 truncate">{chat.contact?.name || chat.contact?.phoneNumber}</h3>
                <span className="text-xs text-gray-500">{new Date(chat.lastMessageAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-500 truncate">
                {chat.messages?.[0]?.textBody || 'No messages'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
