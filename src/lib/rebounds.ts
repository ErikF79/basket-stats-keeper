import type { StatEvent, CourtSide } from '@/types';

export interface ReboundSplit {
  offensive: number;
  defensive: number;
  unknown: number;
}

export const sideOfX = (x: number): CourtSide => (x < 50 ? 'left' : 'right');

export const sideLabel = (side: CourtSide) => (side === 'left' ? 'sinistra' : 'destra');

export const sideArrow = (side: CourtSide) => (side === 'left' ? '\u2190' : '\u2192');

/**
 * Determines the half of the court the team is attacking, inferred from where
 * the most shot attempts (made + missed) were recorded. This is a heuristic:
 * the offensive half is where the team shoots, so rebounds collected there are
 * offensive, and rebounds in the opposite half are defensive.
 *
 * Returns null when there are no shots to infer from.
 */
export function computeAttackingSide(events: StatEvent[]): CourtSide | null {
  const shots = events.filter(e => e.type === 'point' || e.type === 'missed_shot');
  if (shots.length === 0) return null;

  let left = 0;
  for (const shot of shots) {
    if (shot.x < 50) left += 1;
  }
  const right = shots.length - left;

  if (left === right) {
    const avg = shots.reduce((sum, shot) => sum + shot.x, 0) / shots.length;
    return avg < 50 ? 'left' : 'right';
  }

  return left > right ? 'left' : 'right';
}

/**
 * Splits rebound events into offensive/defensive based on the attacking side.
 * Events on the attacking half are offensive; the rest are defensive. When the
 * attacking side is unknown, rebounds are counted as unknown.
 */
export function splitRebounds(events: StatEvent[], attackingSide: CourtSide | null): ReboundSplit {
  const split: ReboundSplit = { offensive: 0, defensive: 0, unknown: 0 };

  for (const event of events) {
    if (event.type !== 'rebound') continue;
    if (!attackingSide) {
      split.unknown += 1;
      continue;
    }
    if (sideOfX(event.x) === attackingSide) split.offensive += 1;
    else split.defensive += 1;
  }

  return split;
}
