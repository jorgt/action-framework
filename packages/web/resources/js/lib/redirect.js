import { goto } from '$app/navigation';
import { redirect as serverRedirect } from '@sveltejs/kit';
import { browser } from '$app/environment';

export function universalRedirect(status, location) {
  if (browser) {
    goto(location);
  } else {
    throw serverRedirect(status, location);
  }
}
