import axios from 'axios';
import notifications from '$lib/store/notifications';

// Set up axios defaults
axios.defaults.baseURL = window.location.origin;
axios.defaults.withCredentials = true;

const handleResponse = async (response, hideNotification = false) => {
  if (response.status === 401) {
    throw new Error('Unauthorized: Redirect to /login');
  }

  if (response.status >= 400) {
    if (!hideNotification) {
      notifications.addNotification({
        type: 'error',
        title: response?.data?.message || response?.data?.error || response?.data || 'An error occurred',
        body: response?.data?.description || 'Please try again',
      });
    }
    throw new Error(`${response.status}: ${response?.data.message || response?.data?.error || response?.data || 'An error occurred'}`);
  }

  return response.data;
};

const handleError = (error, hideNotification = false) => {
  if (error.response) {
    return handleResponse(error.response, hideNotification);
  }
  throw error;
};

const makeRequest = async (method, url, body = null, hideNotification = false) => {
  try {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const response = await axios({
      method,
      url,
      data: body,
      headers: {
        'X-CSRF-TOKEN': token,
      },
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
