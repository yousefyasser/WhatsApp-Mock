import React from 'react';
import { Message } from '../types';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isOutbound = message.direction === 'OUTBOUND';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex w-full ${isOutbound ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-[70%] rounded-lg px-3 py-2 relative shadow ${isOutbound ? 'bg-[#d9fdd3]' : 'bg-white'}`}>
        <p className="text-sm text-gray-800 break-words">{message.textBody}</p>
        <div className="text-[10px] text-gray-500 text-right mt-1 flex justify-end items-center gap-1">
          {time}
        </div>
      </div>
    </div>
  );
};
