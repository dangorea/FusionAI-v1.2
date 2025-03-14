import instance from '../services/api';

/**
 * Sends an audio blob to the server for transcription
 *
 * @param audioBlob The audio blob to transcribe
 * @returns Promise resolving to the transcribed text
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await instance.post(
      `/speech-to-text/transcribe`,
      formData,
    );

    if (!response.data.text) {
      throw new Error(response.data.message || 'Failed to transcribe audio');
    }

    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw error;
  }
};
