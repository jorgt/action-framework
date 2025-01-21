import { readable, writable } from 'svelte/store';

function createNotificationStore() {
  const { subscribe, update } = writable([]);

  return {
    subscribe,
    addNotification: notification => {
      update(notifications => [...notifications, { ...notification, id: Math.random() }]);
    },
    removeNotification: id => {
      update(notifications => notifications.filter(n => n.id !== id));
    },
  };
}

export default createNotificationStore();
