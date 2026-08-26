import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/v22.0',
});

// Since it's a mock, we use a fixed phone number ID or pass it
export const uploadMedia = async (file: File, phoneNumberId: string = '100000000000001'): Promise<{ id: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('messaging_product', 'whatsapp');
  formData.append('type', file.type || 'application/octet-stream');

  const response = await api.post(`/${phoneNumberId}/media`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const downloadMedia = async (mediaId: string): Promise<Blob> => {
  // Step 1: get URL
  const metaResponse = await api.get(`/${mediaId}`);
  const { url } = metaResponse.data;

  // Step 2: get file
  const fileResponse = await axios.get(url, {
    headers: {
      'Authorization': 'Bearer mock_access_token_secret'
    },
    responseType: 'blob'
  });
  
  return fileResponse.data;
};
