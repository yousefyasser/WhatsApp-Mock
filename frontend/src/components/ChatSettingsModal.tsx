import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Chat } from '../types';

interface Props {
  chat: Chat | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedChat: Chat) => void;
}

export const ChatSettingsModal: React.FC<Props> = ({ chat, isOpen, onClose, onUpdate }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if (chat && isOpen) {
      setWebhookUrl(chat.webhookUrl || '');
      setAccessToken(chat.accessToken || '');
    }
  }, [chat, isOpen]);

  if (!isOpen || !chat) return null;

  const handleSave = async () => {
    try {
      const res = await api.put(`/chats/${chat.id}`, { webhookUrl, accessToken });
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">Chat Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Webhook URL</label>
            <input 
              value={webhookUrl} 
              onChange={e => setWebhookUrl(e.target.value)} 
              className="w-full border rounded p-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Access Token</label>
            <input 
              value={accessToken} 
              onChange={e => setAccessToken(e.target.value)} 
              className="w-full border rounded p-2" 
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Save</button>
        </div>
      </div>
    </div>
  );
};
