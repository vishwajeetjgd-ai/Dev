import api from './api';

export const validateCoupon = (code, cartTotal) => api.post('/coupons/validate', { code, cartTotal });
export const getMyCoupons = () => api.get('/coupons/my');
export const getCoupons = () => api.get('/coupons');
export const createCoupon = (data) => api.post('/coupons', data);
export const updateCoupon = (id, data) => api.put(`/coupons/${id}`, data);
export const deleteCoupon = (id) => api.delete(`/coupons/${id}`);
