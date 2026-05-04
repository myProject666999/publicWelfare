import request from '../utils/request';

export const authApi = {
  login: (data) => request.post('/admin/login', data),
  getInfo: () => request.get('/admin/info'),
  updateInfo: (data) => request.put('/admin/info', data),
  changePassword: (data) => request.put('/admin/password', data),
};

export const userApi = {
  getList: (params) => request.get('/admin/users', { params }),
  getById: (id) => request.get(`/admin/users/${id}`),
  updateStatus: (id, data) => request.put(`/admin/users/${id}/status`, data),
  delete: (id) => request.delete(`/admin/users/${id}`),
};

export const volunteerApi = {
  getList: (params) => request.get('/admin/volunteers', { params }),
  getById: (id) => request.get(`/admin/volunteers/${id}`),
  updateStatus: (id, data) => request.put(`/admin/volunteers/${id}/status`, data),
  getApplications: (params) => request.get('/admin/volunteer-applications', { params }),
  approveApplication: (id) => request.put(`/admin/volunteer-applications/${id}/approve`),
  rejectApplication: (id) => request.put(`/admin/volunteer-applications/${id}/reject`),
};

export const activityApi = {
  getList: (params) => request.get('/admin/activities', { params }),
  getById: (id) => request.get(`/admin/activities/${id}`),
  create: (data) => request.post('/admin/activities', data),
  update: (id, data) => request.put(`/admin/activities/${id}`, data),
  delete: (id) => request.delete(`/admin/activities/${id}`),
  updateStatus: (id, data) => request.put(`/admin/activities/${id}/status`, data),
};

export const activityApplicationApi = {
  getList: (params) => request.get('/admin/activity-applications', { params }),
  approve: (id) => request.put(`/admin/activity-applications/${id}/approve`),
  reject: (id) => request.put(`/admin/activity-applications/${id}/reject`),
};

export const registrationApi = {
  getList: (params) => request.get('/admin/registrations', { params }),
};

export const bannerApi = {
  getList: (params) => request.get('/admin/banners', { params }),
  getById: (id) => request.get(`/admin/banners/${id}`),
  create: (data) => request.post('/admin/banners', data),
  update: (id, data) => request.put(`/admin/banners/${id}`, data),
  delete: (id) => request.delete(`/admin/banners/${id}`),
};

export const newsApi = {
  getList: (params) => request.get('/admin/news', { params }),
  getById: (id) => request.get(`/admin/news/${id}`),
  create: (data) => request.post('/admin/news', data),
  update: (id, data) => request.put(`/admin/news/${id}`, data),
  delete: (id) => request.delete(`/admin/news/${id}`),
};

export const messageApi = {
  getList: (params) => request.get('/admin/messages', { params }),
  reply: (id, data) => request.put(`/admin/messages/${id}/reply`, data),
};
