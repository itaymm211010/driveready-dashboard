import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns true if the current time has reached the lesson's scheduled start time.
 * @param date   "YYYY-MM-DD"
 * @param timeStart "HH:MM"
 */
export function canStartLesson(date: string, timeStart: string): boolean {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = timeStart.split(':').map(Number);
  const lessonDateTime = new Date(year, month - 1, day, hour, minute, 0);
  return Date.now() >= lessonDateTime.getTime();
}

/**
 * Formats a lesson's scheduled start as a readable Hebrew string, e.g. "18:00".
 */
export function lessonStartLabel(date: string, timeStart: string): string {
  return timeStart;
}
