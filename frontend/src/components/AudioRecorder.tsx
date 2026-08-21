import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Play, Pause } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  onCancel: () => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Start recording immediately when mounted
    startRecording();
    return () => {
      stopRecording(false);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        // Only trigger complete if we were actually recording and didn't cancel
        if (isRecording) {
          onRecordingComplete(blob);
        }
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      onCancel();
    }
  };

  const stopRecording = (save: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (!save) {
      setIsRecording(false);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 w-full bg-gray-100 rounded-full px-4 py-2">
      <div className="flex items-center gap-2 text-red-500 animate-pulse">
        <div className="w-2 h-2 bg-red-500 rounded-full" />
        <span className="text-sm font-mono">{formatTime(recordingTime)}</span>
      </div>
      
      <div className="flex-1" />
      
      <button 
        onClick={() => {
          stopRecording(false);
          onCancel();
        }}
        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
        title="Cancel"
      >
        <Trash2 size={20} />
      </button>
      
      <button 
        onClick={() => stopRecording(true)}
        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
        title="Stop Recording"
      >
        <Square size={16} fill="currentColor" />
      </button>
    </div>
  );
};
