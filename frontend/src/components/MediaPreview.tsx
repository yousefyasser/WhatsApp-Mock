import React, { useEffect, useState } from 'react';
import { X, FileText, FileAudio, FileVideo, File } from 'lucide-react';

interface Props {
  file: File;
  onDiscard: () => void;
}

export const MediaPreview: React.FC<Props> = ({ file, onDiscard }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const renderIcon = () => {
    if (file.type.startsWith('audio/')) return <FileAudio size={48} className="text-purple-500" />;
    if (file.type.startsWith('video/')) return <FileVideo size={48} className="text-red-500" />;
    if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text/')) {
      return <FileText size={48} className="text-blue-500" />;
    }
    return <File size={48} className="text-gray-500" />;
  };

  return (
    <div className="relative bg-white rounded-lg p-2 m-2 shadow inline-block border border-gray-200">
      <button 
        onClick={onDiscard} 
        className="absolute -top-2 -right-2 bg-gray-200 hover:bg-gray-300 rounded-full p-1 shadow-sm z-10"
      >
        <X size={16} className="text-gray-600" />
      </button>
      
      <div className="flex flex-col items-center justify-center p-2">
        {previewUrl ? (
          file.type.startsWith('image/') ? (
            <img src={previewUrl} alt="Preview" className="max-h-32 max-w-full rounded object-contain" />
          ) : (
            <video src={previewUrl} className="max-h-32 max-w-full rounded object-contain" controls />
          )
        ) : (
          <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded min-w-[120px]">
            {renderIcon()}
            <span className="text-xs text-gray-500 mt-2 max-w-[150px] truncate" title={file.name}>
              {file.name}
            </span>
            <span className="text-[10px] text-gray-400">
              {(file.size / 1024).toFixed(1)} KB
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
