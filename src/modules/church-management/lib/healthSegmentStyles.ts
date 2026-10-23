import type { HealthSegment } from '@/modules/church-management/api/healthTracker';

export function segmentBadgeClass(segment: HealthSegment): string {
  switch (segment) {
    case 'Champion':
    case 'Stable':
      return 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-200';
    case 'Frustrated':
    case 'Fading':
      return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200';
    case 'At Risk':
    case 'Ghosting':
      return 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200';
  }
}

export function healthScoreClass(score: number): string {
  if (score < 40) return 'text-red-700 dark:text-red-400 font-semibold';
  if (score < 65) return 'text-amber-700 dark:text-amber-400 font-semibold';
  return 'text-green-700 dark:text-green-400 font-semibold';
}

export const SEGMENT_ACTIONS: { segment: HealthSegment; meaning: string; action: string }[] = [
  {
    segment: 'Champion',
    meaning: 'High health score, engagement growing or stable.',
    action: 'Recognize the family; invite to volunteer or leadership roles.',
  },
  {
    segment: 'Stable',
    meaning: 'Good engagement; fees and records in order.',
    action: 'Maintain contact; encourage certificate updates and full member list.',
  },
  {
    segment: 'Frustrated',
    meaning: 'Some activity but low fee completion or incomplete profile.',
    action: 'Pastoral visit or call; help with fee payment and member records.',
  },
  {
    segment: 'Fading',
    meaning: 'Fees OK but activity declining over recent months.',
    action: 'Check for relocation, illness, or disengagement; re-invite to church events.',
  },
  {
    segment: 'At Risk',
    meaning: 'Mixed signals; score below target.',
    action: 'Monitor weekly; follow up if fees or activity drop further.',
  },
  {
    segment: 'Ghosting',
    meaning: 'Low score and steep activity decline.',
    action: 'Immediate outreach — edavaka / secretary escalation.',
  },
];
