import React, { useState, useEffect } from 'react';
import { WebhookLog } from '../types';
import api from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WebhookLogsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<WebhookLog[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.get('/webhook-logs').then((res: any) => setLogs(res.data)).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Webhook Delivery Logs</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black font-bold text-xl">&times;</button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Time</th>
                <th className="p-2 border">Code</th>
                <th className="p-2 border">Payload</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b">
                  <td className="p-2 border font-bold text-center">
                    <span className={log.success ? 'text-green-600' : 'text-red-600'}>
                      {log.success ? 'OK' : 'FAIL'}
                    </span>
                  </td>
                  <td className="p-2 border whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-2 border">{log.responseCode || 'N/A'}</td>
                  <td className="p-2 border">
                    <pre className="text-xs bg-gray-50 p-2 rounded max-h-32 overflow-auto">
                      {JSON.stringify(JSON.parse(log.payload), null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No logs found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
