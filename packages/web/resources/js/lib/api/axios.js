import axios from 'axios';

const instance = axios.create({
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

instance.interceptors.request.use(config => {
  const token = document.head.querySelector('meta[name="csrf-token"]')?.content;
  if (token) {
    config.headers['X-CSRF-TOKEN'] = token;
  }
  return config;
});

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 419) {
      // CSRF token mismatch, refresh the page to get a new token
      window.location.reload();
    }
    return Promise.reject(error);
  },
);

export default instance;
