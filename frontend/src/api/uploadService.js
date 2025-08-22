import axios from 'axios';
import axiosInstance from './axios';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

export const uploadFile = async (file) => {
  try {
    // 1. Get signature from our backend
    const { data: signatureData } = await axiosInstance.get('/api/uploads/signature');

    // 2. Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', API_KEY);
    formData.append('timestamp', signatureData.timestamp);
    formData.append('signature', signatureData.signature);
    
    // 3. Upload directly to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
    const { data: cloudinaryData } = await axios.post(cloudinaryUrl, formData);

    return {
      url: cloudinaryData.secure_url,
      publicId: cloudinaryData.public_id,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};