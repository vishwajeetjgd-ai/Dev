import api from './api';

export const placeOrder = (data) => api.post('/orders', data);
export const getMyOrders = (params) => api.get('/orders', { params });
export const getActiveOrders = () => api.get('/orders/active');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.patch(`/orders/${id}/cancel`);
export const updateOrderStatus = (id, data) => api.patch(`/orders/${id}/status`, data);
