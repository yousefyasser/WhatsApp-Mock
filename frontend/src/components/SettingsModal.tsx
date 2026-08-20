import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Setting } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<Setting | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/settings').then((res: any) => setSettings(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !settings) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await api.put('/settings', settings);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input name="phoneNumber" value={settings.phoneNumber} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input name="displayName" value={settings.displayName} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number ID</label>
            <input name="phoneNumberId" value={settings.phoneNumberId} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WABA ID</label>
            <input name="wabaId" value={settings.wabaId} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Access Token</label>
            <input name="accessToken" value={settings.accessToken} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Webhook URL</label>
            <input name="webhookUrl" value={settings.webhookUrl} onChange={handleChange} className="w-full border rounded p-2" />
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
