import { router } from '@inertiajs/svelte';
import notifications from '$lib/store/notifications';

function inertiaRequest({ url, data = {}, method = 'post', successMessage = 'Changes saved successfully', options = {} }) {
  return new Promise((resolve, reject) => {
    router[method](url, data, {
      preserveScroll: true,
      ...options,
      onSuccess: page => {
        const flash = page.props?.flash || {};
        notifications.addNotification({
          title: flash.title || 'Success',
          body: flash.message || successMessage,
          type: flash.type || 'success',
        });
        options.onSuccess?.(page);
        resolve(page);
      },
      onError: errors => {
        notifications.addNotification({
          title: 'Error',
          body: errors.message || 'An error occurred',
          type: 'error',
        });
        options.onError?.(errors);
        reject(errors);
      },
    });
  });
}

export async function inertiaPost({ url, data, successMessage = 'Changes saved successfully', options = {} }) {
  return inertiaRequest({ url, data, method: 'post', successMessage, options });
}

export async function inertiaPut({ url, data, successMessage = 'Changes saved successfully', options = {} }) {
  return inertiaRequest({ url, data, method: 'put', successMessage, options });
}

export async function inertiaDelete({ url, data = {}, successMessage = 'Item deleted successfully', options = {} }) {
  return inertiaRequest({ url, data, method: 'delete', successMessage, options });
}

export async function inertiaPatch({ url, data, successMessage = 'Changes saved successfully', options = {} }) {
  return inertiaRequest({ url, data, method: 'patch', successMessage, options });
}

// Specialized versions for common operations
export async function inertiaUpload({ url, file, fieldName = 'file', successMessage = 'File uploaded successfully', options = {} }) {
  const formData = new FormData();
  formData.append(fieldName, file);
  return inertiaPost({ url, data: formData, successMessage, options });
}

export async function inertiaDownload({ url, filename, errorMessage = 'Failed to download file', options = {} }) {
  return inertiaRequest({
    url,
    method: 'get',
    options: {
      ...options,
      onSuccess: response => {
        // Handle file download
        const blob = new Blob([response.data]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        options.onSuccess?.(response);
      },
      onError: error => {
        notifications.addNotification({
          title: 'Error',
          body: errorMessage,
          type: 'error',
        });
        options.onError?.(error);
      },
    },
  });
}
