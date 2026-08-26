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
  
  const getMediaUrl = (url: string) => url.startsWith('http') ? url : `${API_BASE}${url}`;

  const renderContent = () => {
    if (message.type === 'text') {
      return <p className="text-sm text-gray-800 break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
    
    if (!message.mediaUrl) {
      return <span className="text-gray-500 italic">Media missing</span>;
    }

    const url = getMediaUrl(message.mediaUrl);
    
    switch (message.type) {
      case 'image':
      case 'sticker':
        return (
          <div className="flex flex-col gap-1">
            <img src={url} alt={message.mediaCaption || "Image"} className={`rounded max-h-64 object-contain ${message.type === 'sticker' ? 'bg-transparent' : ''}`} />
            {message.mediaCaption && <p className="text-sm text-gray-800">{message.mediaCaption}</p>}
          </div>
        );
      case 'video':
        return (
          <div className="flex flex-col gap-1">
            <video src={url} controls className="max-h-64 rounded max-w-full" />
            {message.mediaCaption && <p className="text-sm text-gray-800">{message.mediaCaption}</p>}
          </div>
        );
      case 'audio':
        return <audio src={url} controls className="h-10 mt-1 max-w-full" />;
      case 'document':
        return (
          <div className="flex flex-col gap-1">
            <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-2 rounded hover:bg-black/10">
              <span className="text-xl">📄</span>
              <span className="text-sm font-medium text-blue-600 truncate underline">{message.mediaFilename || 'Document'}</span>
            </a>
            {message.mediaCaption && <p className="text-sm text-gray-800">{message.mediaCaption}</p>}
          </div>
        );
      default:
        return <p className="text-sm text-gray-800 break-words whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
  };

  return (
    <div className={`flex w-full ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] rounded-lg px-3 py-2 relative shadow ${isOutbound ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
        {renderContent()}
        <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center gap-1">
          {time}
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};
