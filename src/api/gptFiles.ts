import axiosInstance from './utils/axiosInstance';

export const sendCodeToApi = async (data: { prompt: string }) => {
  try {
    const response = await axiosInstance.post('/code-generation', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Error in POST request:', error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to send data to API');
  }
};
