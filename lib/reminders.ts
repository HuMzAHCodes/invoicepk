// lib/reminders.ts
// Shared cadence logic for overdue-invoice payment reminders — used by app/api/cron/reminders/route.ts.

export const REMINDER_MILESTONES_DAYS = [1, 3, 7, 14];
const REPEAT_INTERVAL_DAYS = 14;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDaysOverdue(dueDate: Date, now: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((startOfDay(now).getTime() - startOfDay(dueDate).getTime()) / msPerDay);
}

// Days-overdue threshold that must be reached before the (reminderCount + 1)-th reminder fires.
function getMilestoneForReminder(reminderCount: number): number {
  if (reminderCount < REMINDER_MILESTONES_DAYS.length) {
    return REMINDER_MILESTONES_DAYS[reminderCount];
  }
  const lastMilestone = REMINDER_MILESTONES_DAYS[REMINDER_MILESTONES_DAYS.length - 1];
  const extraReminders = reminderCount - REMINDER_MILESTONES_DAYS.length + 1;
  return lastMilestone + extraReminders * REPEAT_INTERVAL_DAYS;
}

export interface ReminderCandidate {
  dueDate: Date;
  reminderCount: number;
  lastReminderSentAt: Date | null | undefined;
}

export function shouldSendReminder(invoice: ReminderCandidate, now: Date): boolean {
  if (invoice.lastReminderSentAt && startOfDay(invoice.lastReminderSentAt).getTime() === startOfDay(now).getTime()) {
    return false;
  }

  const daysOverdue = getDaysOverdue(invoice.dueDate, now);
  const nextMilestone = getMilestoneForReminder(invoice.reminderCount);

  return daysOverdue >= nextMilestone;
}
