import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
}

export const MessageInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
      <input
        type="text"
        className="flex-1 rounded-lg border-none px-4 py-2 outline-none"
        placeholder="Type a message"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend} className="p-2 text-gray-500 hover:text-gray-700">
        <Send size={24} />
      </button>
    </div>
  );
};
