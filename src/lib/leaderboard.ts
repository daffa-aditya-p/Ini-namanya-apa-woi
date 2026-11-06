import { getRankInfo } from './ranks';

export interface LeaderboardItem {
  no: number;
  username: string;
  name?: string;
  rankName: string;
  totalXp: number;
  isCurrentUser?: boolean;
}

export const SEED_LEADERBOARD: Omit<LeaderboardItem, 'no' | 'rankName'>[] = [
  { username: 'bram_kernel', name: 'Bramantyo A.', totalXp: 2840 },
  { username: 'citra_ast', name: 'Citra Kirana', totalXp: 1920 },
  { username: 'dewi_wasm', name: 'Dewi Lestari', totalXp: 1450 },
  { username: 'fajar_async', name: 'Fajar Pratama', totalXp: 910 },
  { username: 'gilang_py', name: 'Gilang Ramadhan', totalXp: 640 },
  { username: 'hana_v8', name: 'Hana Valerie', totalXp: 430 },
  { username: 'ilham_lex', name: 'Ilham Hidayat', totalXp: 275 },
  { username: 'joko_algo', name: 'Joko Susilo', totalXp: 160 },
  { username: 'kevin_loop', name: 'Kevin Sanjaya', totalXp: 85 },
  { username: 'lina_syntax', name: 'Lina Marlina', totalXp: 35 },
];

/**
 * Builds the complete sorted leaderboard, integrating the current active user.
 */
export function buildLeaderboard(currentUser?: { username: string; xp: number; name?: string }): LeaderboardItem[] {
  // Start with seed data
  const entries: Array<{ username: string; name?: string; totalXp: number; isCurrentUser?: boolean }> = [
    ...SEED_LEADERBOARD,
  ];

  if (currentUser && currentUser.username) {
    const existingIndex = entries.findIndex(
      (e) => e.username.toLowerCase() === currentUser.username.toLowerCase()
    );

    if (existingIndex >= 0) {
      entries[existingIndex] = {
        ...entries[existingIndex],
        totalXp: currentUser.xp,
        name: currentUser.name || entries[existingIndex].name,
        isCurrentUser: true,
      };
    } else {
      entries.push({
        username: currentUser.username,
        name: currentUser.name || currentUser.username,
        totalXp: currentUser.xp,
        isCurrentUser: true,
      });
    }
  }

  // Sort descending by total XP
  entries.sort((a, b) => b.totalXp - a.totalXp);

  // Assign 1-based ranks and resolve Rank names strictly via getRankInfo
  return entries.map((entry, idx) => ({
    no: idx + 1,
    username: entry.username,
    name: entry.name,
    totalXp: entry.totalXp,
    rankName: getRankInfo(entry.totalXp).tier,
    isCurrentUser: Boolean(entry.isCurrentUser),
  }));
}
