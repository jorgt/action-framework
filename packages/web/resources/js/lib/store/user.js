import { writable } from 'svelte/store';

function createUserStore() {
  const user = writable({});

  return {
    ...user,
  };
}

export default createUserStore();
