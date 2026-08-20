import React, { useEffect, useRef } from 'react';
import { Chat, Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import api from '../services/api';

interface Props {
  chat: Chat | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<Props> = ({ chat, messages, onSendMessage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!chat) return <div className="flex-1 flex items-center justify-center bg-[#efeae2] text-gray-500">Select a chat</div>;

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2]">
      <div className="bg-[#f0f2f5] px-4 py-3 border-b flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold mr-3">
          {chat.contact?.name?.[0]?.toUpperCase() || '#'}
        </div>
        <h2 className="font-semibold text-gray-800">{chat.contact?.name || chat.contact?.phoneNumber}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}
      </div>

      <MessageInput onSend={onSendMessage} />
    </div>
  );
};
