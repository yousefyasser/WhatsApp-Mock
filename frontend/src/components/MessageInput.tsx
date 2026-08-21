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
      // reset height
      const ta = document.getElementById('message-textarea');
      if (ta) ta.style.height = 'auto';
    }
  };

  return (
    <div className="bg-[#f0f2f5] p-3 flex items-center gap-2">
      <textarea
        id="message-textarea"
        className="flex-1 rounded-lg border-none px-4 py-2 outline-none resize-none min-h-[40px] max-h-[120px]"
        placeholder="Type a message"
        rows={1}
        value={text}
        onChange={e => {
          setText(e.target.value);
          e.target.style.height = 'auto';
          e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
        }}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey || e.shiftKey) {
              // Allow default behavior (new line)
              return;
            } else {
              e.preventDefault();
              handleSend();
            }
          }
        }}
      />
      <button onClick={handleSend} className="p-2 text-gray-500 hover:text-gray-700">
        <Send size={24} />
      </button>
    </div>
  );
};
