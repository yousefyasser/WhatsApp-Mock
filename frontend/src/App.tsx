import React, { useState, useEffect } from 'react';
import { SettingsModal } from './components/SettingsModal';
import { WebhookLogsModal } from './components/WebhookLogsModal';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Settings, Activity } from 'lucide-react';
import api from './services/api';
import socket from './services/socket';
import { Chat, Message } from './types';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchChats = () => {
    api.get('/chats').then((res: any) => setChats(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchChats();

    socket.on('message:received', (msg: Message) => {
      fetchChats();
      if (activeChatId === msg.chatId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on('message:status', (updatedMsg: Message) => {
      if (activeChatId === updatedMsg.chatId) {
        setMessages(prev => prev.map(m => m.id === updatedMsg.id ? { ...m, status: updatedMsg.status } : m));
      }
    });

    return () => {
      socket.off('message:received');
      socket.off('message:status');
    };
  }, [activeChatId]);

  useEffect(() => {
    if (activeChatId) {
      api.get(`/chats/${activeChatId}/messages`).then((res: any) => setMessages(res.data)).catch(console.error);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  const handleNewChat = async (phoneNumber: string, webhookUrl: string, accessToken: string) => {
    try {
      const res = await api.post('/chats', { phoneNumber, name: phoneNumber, webhookUrl, accessToken });
      fetchChats();
      setActiveChatId(res.data.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!activeChatId) return;
    try {
      const res = await api.post(`/chats/${activeChatId}/messages`, { text });
      // The socket event will append the message to the list
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await api.delete(`/chats/${id}`);
      setChats(prev => prev.filter(c => c.id !== id));
      if (activeChatId === id) {
        setActiveChatId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-[#00a884] text-white p-4 flex justify-between items-center shadow-md z-10">
        <h1 className="text-xl font-bold">WhatsApp Mock Service</h1>
        <div className="flex gap-2">
          <button onClick={() => setIsLogsOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Webhook Logs">
            <Activity size={24} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-white/20 rounded-full" title="Settings">
            <Settings size={24} />
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <Sidebar 
          chats={chats} 
          activeChatId={activeChatId} 
          onSelectChat={setActiveChatId} 
          onNewChat={handleNewChat} 
        />
        <ChatWindow 
          chat={activeChat} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
          onUpdateChat={(updatedChat) => {
            setChats(prev => prev.map(c => c.id === updatedChat.id ? { ...c, webhookUrl: updatedChat.webhookUrl, accessToken: updatedChat.accessToken } : c));
          }}
          onDeleteChat={handleDeleteChat}
        />
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <WebhookLogsModal isOpen={isLogsOpen} onClose={() => setIsLogsOpen(false)} />
    </div>
  );
}

export default App;
