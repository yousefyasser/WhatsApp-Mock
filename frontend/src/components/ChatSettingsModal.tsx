import React, { useState, useEffect } from 'react';
import { Chat } from '../types';

interface Props {
  chat: Chat;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<Chat> & { contactPhone?: string }) => void;
}

const InputField = ({ label, value, onChange, hint, type = "text" }: { label: string, value: string, onChange: (v: string) => void, hint: string, type?: string }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium text-gray-700 mb-1" title={hint}>
      {label} <span className="text-gray-400 font-normal cursor-help">ⓘ</span>
    </label>
    <input
      type={type}
      className={`w-full p-2 border rounded ${type === 'color' ? 'h-10 p-1' : ''}`}
      value={value}
      onChange={e => onChange(e.target.value)}
      title={hint}
    />
  </div>
);

const GroupHeader = ({ title }: { title: string }) => (
  <div className="mt-6 mb-3">
    <h3 className="text-md font-bold text-gray-800">{title}</h3>
    <hr className="mt-1 border-gray-200" />
  </div>
);

export const ChatSettingsModal: React.FC<Props> = ({ chat, isOpen, onClose, onSave }) => {
  const [webhookUrl, setWebhookUrl] = useState(chat.webhookUrl);
  const [webhookVerifyToken, setWebhookVerifyToken] = useState(chat.webhookVerifyToken);
  const [phoneNumberId, setPhoneNumberId] = useState(chat.phoneNumberId);
  const [wabaId, setWabaId] = useState(chat.wabaId);
  const [contactPhone, setContactPhone] = useState(chat.contact?.phoneNumber || '');
  
  const [phoneNumber, setPhoneNumber] = useState(chat.phoneNumber);
  const [displayName, setDisplayName] = useState(chat.displayName);
  
  const [tags, setTags] = useState(chat.tags || '');
  const [backgroundColor, setBackgroundColor] = useState(chat.backgroundColor || '#efeae2');

  useEffect(() => {
    if (isOpen) {
      setWebhookUrl(chat.webhookUrl);
      setWebhookVerifyToken(chat.webhookVerifyToken);
      setPhoneNumberId(chat.phoneNumberId);
      setWabaId(chat.wabaId);
      setContactPhone(chat.contact?.phoneNumber || '');
      
      setPhoneNumber(chat.phoneNumber);
      setDisplayName(chat.displayName);
      
      setTags(chat.tags || '');
      setBackgroundColor(chat.backgroundColor || '#efeae2');
    }
  }, [chat, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      webhookUrl,
      webhookVerifyToken,
      phoneNumberId,
      wabaId,
      contactPhone,
      phoneNumber,
      displayName,
      tags,
      backgroundColor
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-2">Chat Settings</h2>
        
        <GroupHeader title="Server Settings" />
        <InputField label="Webhook URL" value={webhookUrl} onChange={setWebhookUrl} hint="The URL where incoming messages should be sent." />
        <InputField label="Verify Token" value={webhookVerifyToken} onChange={setWebhookVerifyToken} hint="Token used to verify the webhook setup." />
        <InputField label="Phone Number ID" value={phoneNumberId} onChange={setPhoneNumberId} hint="The ID of your WABA phone number." />
        <InputField label="WABA ID" value={wabaId} onChange={setWabaId} hint="Your WhatsApp Business Account ID." />
        <InputField label="Contact Phone" value={contactPhone} onChange={setContactPhone} hint="The phone number of the recipient you are messaging." />

        <GroupHeader title="Sender Details" />
        <InputField label="Sender Phone Number" value={phoneNumber} onChange={setPhoneNumber} hint="Your WABA phone number." />
        <InputField label="Display Name" value={displayName} onChange={setDisplayName} hint="The display name of your WhatsApp Business Account." />

        <GroupHeader title="Others" />
        <InputField label="Tags" value={tags} onChange={setTags} hint="Comma-separated tags for categorizing this chat." />
        <InputField label="Background Color" type="color" value={backgroundColor} onChange={setBackgroundColor} hint="Color palette for the chat background." />

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Save</button>
        </div>
      </div>
    </div>
  );
};
