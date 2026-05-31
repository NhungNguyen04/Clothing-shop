import axiosInstance from '../api/axiosInstance';

export interface TryOnRequest {
  personImageUrl: string;
  productImageUrl: string;
}

export interface TryOnResponse {
  success: boolean;
  message: string;
  error: string | null;
  data: {
    imageUrl: string;
  };
}

export const uploadTryOnImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post('upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Accept': 'application/json',
    },
    timeout: 60000,
  });

  const result = response.data;
  if (!result?.success) {
    throw new Error(result?.error || 'Failed to upload image');
  }

  return result.data.url || result.data;
};

export const generateTryOnImage = async (payload: TryOnRequest): Promise<string> => {
  const response = await axiosInstance.post<TryOnResponse>('try-on', payload, {
    timeout: 120000,
  });

  const result = response.data;
  if (!result?.success || !result?.data?.imageUrl) {
    throw new Error(result?.error || 'Try-on generation failed');
  }

  return result.data.imageUrl;
};
