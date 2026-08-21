import React, { useEffect, useRef, useState } from 'react';
import { Chat, Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { ChatSettingsModal } from './ChatSettingsModal';
import { Settings } from 'lucide-react';
import api from '../services/api';

interface Props {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onUpdateChat: (chat: Chat) => void;
}

export const ChatWindow: React.FC<Props> = ({ chat, messages, onSendMessage, onUpdateChat }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chat) return <div className="flex-1 flex items-center justify-center bg-[#efeae2] text-gray-500">Select a chat</div>;

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2]">
      <div className="bg-[#f0f2f5] px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-3">
            {chat.contact?.name?.[0]?.toUpperCase() || '#'}
          </div>
          <h2 className="font-semibold text-gray-800">{chat.contact?.name || chat.contact?.phoneNumber}</h2>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)} 
          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200"
          title="Chat Settings"
        >
          <Settings size={20} />
        </button>
      </div>
      
      <ChatSettingsModal 
        chat={chat} 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        onUpdate={onUpdateChat} 
      />
      
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      </div>

      <MessageInput onSend={onSendMessage} />
    </div>
  );
};
