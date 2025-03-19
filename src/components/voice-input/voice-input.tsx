import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button, message, Tooltip } from 'antd';
import { AudioOutlined, LoadingOutlined } from '@ant-design/icons';
import { transcribeAudio } from '../../api/speech-to-text';
import './voice-input.module.scss';

interface VoiceInputBetterProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({
  onTranscriptionComplete,
  disabled = false,
}: VoiceInputBetterProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: 'audio/webm',
          });
          const transcription = await transcribeAudio(audioBlob);
          onTranscriptionComplete(transcription);
          message.success('Voice input processed successfully');
        } catch (error) {
          console.error('Error processing voice input:', error);
          message.error('Failed to process voice input');
        } finally {
          setIsProcessing(false);
          setRecordingTime(0);
        }
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      message.error('Could not access microphone');
    }
  }, [onTranscriptionComplete]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  let content;
  if (isProcessing) {
    content = (
      <Tooltip title="Processing voice input">
        <Button type="text" icon={<LoadingOutlined />} disabled />
      </Tooltip>
    );
  } else if (isRecording) {
    content = (
      <Button
        type="primary"
        shape="round"
        danger
        size="large"
        onClick={stopRecording}
        className="recording-big-button"
      >
        {formatTime(recordingTime)}
      </Button>
    );
  } else {
    content = (
      <Tooltip title="Record voice input">
        <Button
          type="text"
          icon={<AudioOutlined />}
          onClick={startRecording}
          disabled={disabled}
        />
      </Tooltip>
    );
  }

  return <div className="voice-input-container">{content}</div>;
}
