import request from '../utils/request';

export const authApi = {
  login: (data) => request.post('/login', data),
  register: (data) => request.post('/register', data),
  getUserInfo: () => request.get('/user/info'),
  updateUserInfo: (data) => request.put('/user/info', data),
  changePassword: (data) => request.put('/user/password', data),
};

export const bannerApi = {
  getBanners: () => request.get('/banners'),
};

export const newsApi = {
  getNewsList: (params) => request.get('/news', { params }),
  getNewsDetail: (id) => request.get(`/news/${id}`),
};

export const activityApi = {
  getActivities: (params) => request.get('/activities', { params }),
  getActivityDetail: (id) => request.get(`/activities/${id}`),
  applyActivity: (data) => request.post('/activities/apply', data),
  registerActivity: (data) => request.post('/activities/register', data),
};

export const favoriteApi = {
  getFavorites: () => request.get('/user/favorites'),
  addFavorite: (data) => request.post('/user/favorites', data),
  removeFavorite: (id) => request.delete(`/user/favorites/${id}`),
};

export const messageApi = {
  createMessage: (data) => request.post('/messages', data),
  getMessages: () => request.get('/messages'),
  getMessageDetail: (id) => request.get(`/messages/${id}`),
};

export const volunteerApi = {
  applyVolunteer: (data) => request.post('/volunteer/apply', data),
  getApplication: () => request.get('/volunteer/application'),
  getInfo: () => request.get('/volunteer/info'),
  updateInfo: (data) => request.put('/volunteer/info', data),
  getRegistrations: () => request.get('/volunteer/registrations'),
  cancelRegistration: (id) => request.delete(`/activities/register/${id}`),
};

export const applicationApi = {
  getUserApplications: () => request.get('/user/applications'),
};
