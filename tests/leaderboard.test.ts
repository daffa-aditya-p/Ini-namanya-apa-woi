import { describe, it, expect } from 'vitest';
import { buildLeaderboard, SEED_LEADERBOARD } from '../src/lib/leaderboard';

describe('Leaderboard Data Builder', () => {
  it('builds leaderboard with seed data sorted by XP descending', () => {
    const list = buildLeaderboard();
    expect(list.length).toBe(SEED_LEADERBOARD.length);

    // Verify ordering
    for (let i = 0; i < list.length - 1; i++) {
      expect(list[i].totalXp).toBeGreaterThanOrEqual(list[i + 1].totalXp);
      expect(list[i].no).toBe(i + 1);
    }

    // Top position check
    expect(list[0].no).toBe(1);
    expect(list[0].rankName).toBe('Immortal');
  });

  it('correctly inserts active user in the appropriate ranking slot', () => {
    // Current user with 750 XP (Master), should land between 910 XP and 640 XP
    const list = buildLeaderboard({
      username: 'ahmad_koding',
      xp: 750,
      name: 'Ahmad Koding',
    });

    const userEntry = list.find((item) => item.username === 'ahmad_koding');
    expect(userEntry).toBeDefined();
    expect(userEntry?.isCurrentUser).toBe(true);
    expect(userEntry?.rankName).toBe('Master');
    expect(userEntry?.totalXp).toBe(750);

    // Verify sequential numbering
    list.forEach((item, index) => {
      expect(item.no).toBe(index + 1);
    });
  });

  it('updates existing seed user if current user matches username', () => {
    const list = buildLeaderboard({
      username: 'kevin_loop',
      xp: 3000, // promoted to Immortal!
    });

    const updated = list.find((item) => item.username === 'kevin_loop');
    expect(updated).toBeDefined();
    expect(updated?.no).toBe(1); // Now top of the board
    expect(updated?.rankName).toBe('Immortal');
    expect(updated?.isCurrentUser).toBe(true);
  });
});
