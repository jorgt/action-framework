import axios from 'axios';
import notifications from '$lib/store/notifications';

const api = axios.create({
  baseURL: window.location.origin,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      config.headers['X-CSRF-TOKEN'] = token;
    }
    return config;
  },
  error => null,
);

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 419) {
      window.location.reload();
      return null;
    }
    return null;
  },
);

const handleResponse = (response, hideNotification = false) => {
  const data = response?.data;

  if (!hideNotification && response.config.method !== 'get' && data?.message) {
    notifications.addNotification({
      type: 'success',
      title: data.message,
      body: data.description || '',
    });
  }

  return data;
};

const handleError = (error, hideNotification = false) => {
  if (!error.response) {
    if (!hideNotification) {
      notifications.addNotification({
        type: 'error',
        title: 'Network Error',
        body: 'Please check your connection and try again',
      });
    }
    return null;
  }

  const response = error.response;
  const data = response.data;

  if (response.status === 401) {
    window.location.href = '/login';
    return null;
  }

  if (!hideNotification) {
    notifications.addNotification({
      type: 'error',
      title: data?.message || data?.error || 'An error occurred',
      body: data?.description || 'Please try again',
    });
  }

  return null;
};

const makeRequest = async (method, url, body = null, hideNotification = false) => {
  try {
    const response = await api({
      method,
      url,
      data: body,
    });
    return handleResponse(response, hideNotification);
  } catch (error) {
    return handleError(error, hideNotification);
  }
};

export const get = (url, hideNotification = false) => makeRequest('get', url, null, hideNotification);
export const del = (url, hideNotification = false) => makeRequest('delete', url, null, hideNotification);
export const post = (url, body, hideNotification = false) => makeRequest('post', url, body, hideNotification);
export const put = (url, body, hideNotification = false) => makeRequest('put', url, body, hideNotification);

export default {
  get,
  del,
  post,
  put,
};
