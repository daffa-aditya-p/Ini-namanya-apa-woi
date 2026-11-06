export type RankTier =
  | 'Bronze I'
  | 'Bronze II'
  | 'Gold I'
  | 'Gold II'
  | 'Diamond'
  | 'Heroic'
  | 'Master'
  | 'Grandmaster'
  | 'Immortal';

export interface RankDefinition {
  tier: RankTier;
  minXp: number;
  maxXp: number | null; // null for Immortal (unbounded)
  badgeLabel: string;
  badgeClass: string;
  borderClass: string;
  description: string;
}

export const RANK_TIERS: RankDefinition[] = [
  {
    tier: 'Bronze I',
    minXp: 0,
    maxXp: 50,
    badgeLabel: 'Bronze I',
    badgeClass: 'bg-amber-900/10 text-amber-900 dark:bg-amber-700/20 dark:text-amber-300',
    borderClass: 'border-amber-800/30',
    description: 'Langkah pertama menjelajahi dasar-dasar komputasi.',
  },
  {
    tier: 'Bronze II',
    minXp: 51,
    maxXp: 100,
    badgeLabel: 'Bronze II',
    badgeClass: 'bg-amber-800/15 text-amber-950 dark:bg-amber-600/25 dark:text-amber-200',
    borderClass: 'border-amber-700/35',
    description: 'Mulai memahami tipe data dan instruksi dasar.',
  },
  {
    tier: 'Gold I',
    minXp: 101,
    maxXp: 200,
    badgeLabel: 'Gold I',
    badgeClass: 'bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    borderClass: 'border-amber-500/40',
    description: 'Kefasihan dalam mutabilitas nilai dan manipulasi variabel.',
  },
  {
    tier: 'Gold II',
    minXp: 201,
    maxXp: 300,
    badgeLabel: 'Gold II',
    badgeClass: 'bg-amber-500/20 text-amber-900 dark:bg-amber-400/25 dark:text-amber-200',
    borderClass: 'border-amber-500/50',
    description: 'Menguasai percabangan logika dan struktur data primitif.',
  },
  {
    tier: 'Diamond',
    minXp: 301,
    maxXp: 500,
    badgeLabel: 'Diamond',
    badgeClass: 'bg-cyan-600/15 text-cyan-900 dark:bg-cyan-500/20 dark:text-cyan-200',
    borderClass: 'border-cyan-600/40',
    description: 'Mampu menyusun fungsi modular dan algoritma terstruktur.',
  },
  {
    tier: 'Heroic',
    minXp: 501,
    maxXp: 700,
    badgeLabel: 'Heroic',
    badgeClass: 'bg-[var(--accent-terracotta)]/15 text-[var(--accent-terracotta)] dark:bg-[var(--accent-terracotta)]/25 dark:text-red-300',
    borderClass: 'border-[var(--accent-terracotta)]/40',
    description: 'Ketangguhan pemecahan masalah algoritma dan penelusuran runtime.',
  },
  {
    tier: 'Master',
    minXp: 701,
    maxXp: 1000,
    badgeLabel: 'Master',
    badgeClass: 'bg-indigo-600/15 text-indigo-900 dark:bg-indigo-400/25 dark:text-indigo-200',
    borderClass: 'border-indigo-600/40',
    description: 'Penguasaan arsitektur eksekusi, memori, dan paradigma bahasa.',
  },
  {
    tier: 'Grandmaster',
    minXp: 1001,
    maxXp: 2000,
    badgeLabel: 'Grandmaster',
    badgeClass: 'bg-purple-600/15 text-purple-900 dark:bg-purple-400/25 dark:text-purple-200',
    borderClass: 'border-purple-600/40',
    description: 'Keahlian tingkat tinggi dalam optimasi komputasi dan pemecahan masalah kompleks.',
  },
  {
    tier: 'Immortal',
    minXp: 2001,
    maxXp: null,
    badgeLabel: 'Immortal',
    badgeClass: 'bg-[var(--text-primary)] text-[var(--bg-surface)] dark:bg-[var(--text-primary)] dark:text-[var(--bg-canvas)]',
    borderClass: 'border-[var(--text-primary)]',
    description: 'Puncak dedikasi dan ketajaman rekayasa kode di belajar.in.',
  },
];

export interface UserRankStatus {
  tier: RankTier;
  definition: RankDefinition;
  currentXp: number;
  nextRank: RankDefinition | null;
  xpNeededForNext: number;
  progressPercent: number;
}

/**
 * Computes rank tier and next-tier progress from total XP.
 */
export function getRankInfo(xp: number): UserRankStatus {
  const numericXp = typeof xp === 'number' ? xp : Number(xp);
  const safeXp = Number.isFinite(numericXp) ? Math.max(0, Math.round(numericXp)) : 0;

  let defIndex = 0;
  if (safeXp <= 50) {
    defIndex = 0; // Bronze I (0-50 XP)
  } else if (safeXp <= 100) {
    defIndex = 1; // Bronze II (51-100 XP)
  } else if (safeXp <= 200) {
    defIndex = 2; // Gold I (101-200 XP)
  } else if (safeXp <= 300) {
    defIndex = 3; // Gold II (201-300 XP)
  } else if (safeXp <= 500) {
    defIndex = 4; // Diamond (301-500 XP)
  } else if (safeXp <= 700) {
    defIndex = 5; // Heroic (501-700 XP)
  } else if (safeXp <= 1000) {
    defIndex = 6; // Master (701-1000 XP)
  } else if (safeXp <= 2000) {
    defIndex = 7; // Grandmaster (1001-2000 XP)
  } else {
    defIndex = 8; // Immortal (2001+ XP)
  }

  const definition = RANK_TIERS[defIndex];
  const nextRank = defIndex < RANK_TIERS.length - 1 ? RANK_TIERS[defIndex + 1] : null;

  let progressPercent = 100;
  let xpNeededForNext = 0;

  if (nextRank && definition.maxXp !== null) {
    const tierSpan = definition.maxXp - definition.minXp + 1;
    const progressInTier = safeXp - definition.minXp;
    progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / tierSpan) * 100)));
    xpNeededForNext = Math.max(0, nextRank.minXp - safeXp);
  }

  return {
    tier: definition.tier,
    definition,
    currentXp: safeXp,
    nextRank,
    xpNeededForNext,
    progressPercent,
  };
}
