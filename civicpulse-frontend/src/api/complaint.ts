//Added for Module-2 - 18/12

// Location: src/api/complaints.ts
import { api } from './client'; // Re-using your existing axios configuration

// 1. Fetch Complaint Categories
export const getCategories = async () => {
  const response = await api.get('/complaints/categories');
  return response.data;
};

// 2. Submit a new Complaint
export const submitComplaint = async (formData: any) => {
  // We don't need to manually set Content-Type; axios handles FormData automatically
  const response = await api.post('/complaints/add', formData);
  return response.data;
};

// 3. Get User's Complaint History
export const getUserComplaints = async (userId: number) => {
  const response = await api.get(`/complaints/my-complaints/${userId}`);
  return response.data;
};


// Fetch ALL complaints (for Admin only)
export const getAllComplaints = async () => {
    const response = await api.get('/complaints/all');
    return response.data;
};