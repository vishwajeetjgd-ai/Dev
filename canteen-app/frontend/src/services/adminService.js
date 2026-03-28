import api from './api';

export const getDashboard = () => api.get('/admin/dashboard');
export const getAllOrders = (params) => api.get('/admin/orders', { params });
export const getQueueInfo = () => api.get('/tokens/queue');
export const advanceToken = () => api.patch('/tokens/advance');
