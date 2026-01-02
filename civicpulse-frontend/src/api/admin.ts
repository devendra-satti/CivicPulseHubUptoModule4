import { api } from './client'; // Import the axios instance we setup earlier

// 1. Fetch all pending officers
export const getPendingOfficers = async () => {
  const response = await api.get('/admin/pending-officers');
  return response.data;
};

// 2. Approve a specific officer
export const approveOfficer = async (id: number) => {
  const response = await api.put(`/admin/approve/${id}`);
  return response.data;
};