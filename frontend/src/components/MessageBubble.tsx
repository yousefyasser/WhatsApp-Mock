import React from 'react';
import { Message } from '../types';
import { parseWhatsAppMarkdown } from '../utils/whatsappMarkdownParser';
import { Check, CheckCheck } from 'lucide-react';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isOutbound = message.direction === 'OUTBOUND';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const htmlContent = message.textBody ? parseWhatsAppMarkdown(message.textBody) : '';

  const getStatusIcon = () => {
    if (!isOutbound) return null;
    switch (message.status) {
      case 'SENT': return <Check size={14} className="text-gray-500" />;
      case 'DELIVERED': return <CheckCheck size={14} className="text-gray-500" />;
      case 'READ': return <CheckCheck size={14} className="text-blue-500" />;
      default: return null;
    }
  };

  const API_BASE = 'http://localhost:3000'; // Default API URL for media relative links

  return (
    <div className={`flex w-full ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] rounded-lg px-3 py-2 relative shadow ${isOutbound ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
        {message.type === 'audio' && message.mediaUrl ? (
          <audio src={`${API_BASE}${message.mediaUrl}`} controls className="h-10 mt-1 max-w-full" />
        ) : (
          <p className="text-sm text-gray-800 break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: htmlContent }} />
        )}
        <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center gap-1">
          {time}
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};
