import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatTime(date: Date | string): string {
  return format(new Date(date), 'h:mm a');
}

export function formatDateTime(date: Date | string): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function truncate(text: string, maxLength: number): string {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
}

export const FREE_LIMITS = {
  kanbanBoards: 3,
  kanbanTasks: 25,
  notes: 10,
  spaces: 10,
  aiActionsPerDay: 5,
  aiTemplates: 1,
};

export const AI_ACTIONS_RESET_HOUR = 0; // midnight UTC

export default {
  cn,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  truncate,
  generateId,
  FREE_LIMITS,
};
