import instance from '../services/api';

export const createCodeGenerationSession = async (data: { prompt: string }) => {
  try {
    const response = await instance.post('/code-generation', data);

    return response.data;
  } catch (error: any) {
    console.error('Error in POST request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to send data to API');
  }
};
