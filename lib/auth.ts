import { currentUser } from '@clerk/nextjs/server';

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

export function isAuthenticated(user: any) {
  return !!user;
}
