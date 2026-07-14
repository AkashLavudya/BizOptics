import { PriorityLevel } from './enums';
import { PRIORITY_THRESHOLDS } from './constants';

// ============================================================
// SCORE UTILITIES
// ============================================================

export function getPriorityLevel(score: number): PriorityLevel {
  if (score >= PRIORITY_THRESHOLDS.CRITICAL) return PriorityLevel.CRITICAL;
  if (score >= PRIORITY_THRESHOLDS.HIGH) return PriorityLevel.HIGH;
  if (score >= PRIORITY_THRESHOLDS.MEDIUM) return PriorityLevel.MEDIUM;
  return PriorityLevel.LOW;
}

export function calculateFinalScore(
  websiteScore: number,
  automationScore: number,
  aiScore: number,
): number {
  const weighted = websiteScore * 0.35 + automationScore * 0.35 + aiScore * 0.30;
  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.round(((value - min) / (max - min)) * 100);
}

// ============================================================
// STRING UTILITIES
// ============================================================

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function formatBusinessCategory(category: string): string {
  return category
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

// ============================================================
// DATE UTILITIES
// ============================================================

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return formatDate(date);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'just now';
}

// ============================================================
// VALIDATION UTILITIES
// ============================================================

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-().]{7,20}$/;
  return phoneRegex.test(phone);
}

// ============================================================
// COLOR UTILITIES FOR SCORES
// ============================================================

export function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green
  if (score >= 60) return '#3b82f6'; // blue
  if (score >= 40) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case PriorityLevel.CRITICAL: return '#ef4444';
    case PriorityLevel.HIGH: return '#f97316';
    case PriorityLevel.MEDIUM: return '#f59e0b';
    case PriorityLevel.LOW: return '#6b7280';
    default: return '#6b7280';
  }
}
