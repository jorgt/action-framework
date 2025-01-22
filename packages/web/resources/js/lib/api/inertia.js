import { router } from '@inertiajs/svelte'
import notifications from '$lib/store/notifications'

function inertiaRequest({
  url,
  data = {},
  method = 'post',
  successMessage = 'Changes saved successfully',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  return new Promise((resolve, reject) => {
    router[method](url, data, {
      preserveState,
      preserveScroll,
      ...options,
      onSuccess: (page) => {
        const flash = page.props?.flash || {}
        notifications.addNotification({
          title: flash.title || 'Success',
          body: flash.message || successMessage,
          type: flash.type || 'success',
        })
        options.onSuccess?.(page)
        resolve(page)
      },
      onError: (errors) => {
        notifications.addNotification({
          title: 'Error',
          body: errors.message || 'An error occurred',
          type: 'error',
        })
        options.onError?.(errors)
        reject(errors)
      },
    })
  })
}

export async function inertiaPost({
  url,
  data,
  successMessage = 'Changes saved successfully',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  return inertiaRequest({
    url,
    data,
    method: 'post',
    successMessage,
    options,
    preserveScroll,
    preserveState,
  })
}

export async function inertiaPut({
  url,
  data,
  successMessage = 'Changes saved successfully',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  return inertiaRequest({
    url,
    data,
    method: 'put',
    successMessage,
    options,
    preserveScroll,
    preserveState,
  })
}

export async function inertiaDelete({
  url,
  data = {},
  successMessage = 'Item deleted successfully',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  return inertiaRequest({
    url,
    data,
    method: 'delete',
    successMessage,
    options,
    preserveScroll,
    preserveState,
  })
}

export async function inertiaPatch({
  url,
  data,
  successMessage = 'Changes saved successfully',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  return inertiaRequest({
    url,
    data,
    method: 'patch',
    successMessage,
    options,
    preserveScroll,
    preserveState,
  })
}

// Specialized versions for common operations
export async function inertiaUpload({
  url,
  file,
  fieldName = 'file',
  successMessage = 'File uploaded successfully',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  const formData = new FormData()
  formData.append(fieldName, file)
  return inertiaPost({
    url,
    data: formData,
    successMessage,
    options,
    preserveScroll,
    preserveState,
  })
}

export async function inertiaDownload({
  url,
  filename,
  errorMessage = 'Failed to download file',
  options = {},
  preserveScroll = true,
  preserveState = true,
}) {
  return inertiaRequest({
    url,
    method: 'get',
    options: {
      ...options,
      onSuccess: (response) => {
        // Handle file download
        const blob = new Blob([response.data])
        const downloadUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)

        options.onSuccess?.(response)
      },
      onError: (error) => {
        notifications.addNotification({
          title: 'Error',
          body: errorMessage,
          type: 'error',
        })
        options.onError?.(error)
      },
    },
  })
}
