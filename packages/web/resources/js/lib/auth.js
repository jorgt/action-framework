// lib/auth.js
import { page } from '@inertiajs/svelte';
import { get } from 'svelte/store';

export const hasPermission = permissionName => {
  return !permissionName || (get(page).props.auth.user?.permissions ?? []).some(p => p.name === permissionName);
};

export const hasRole = roleName => {
  return !roleName || (get(page).props.auth.user?.roles ?? []).some(r => r.name === roleName);
};

export const hasAnyPermission = permissionNames => {
  return !permissionNames?.length || permissionNames.some(permission => hasPermission(permission));
};

export const hasAllPermissions = permissionNames => {
  return !permissionNames?.length || permissionNames.every(permission => hasPermission(permission));
};
