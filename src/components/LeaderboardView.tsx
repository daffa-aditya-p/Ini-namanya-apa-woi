import React, { useState, useEffect } from 'react';
import { buildLeaderboard, type LeaderboardItem } from '../lib/leaderboard';
import { getSavedSession, type UserProfile } from '../lib/userStore';
import { TrophyIcon } from './Icons';

export function LeaderboardView() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [search, setSearch] = useState('');
  const [filterRank, setFilterRank] = useState('ALL');

  useEffect(() => {
    const session = getSavedSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  const leaderboardData: LeaderboardItem[] = buildLeaderboard(
    currentUser
      ? {
          username: currentUser.username,
          xp: currentUser.xp,
          name: currentUser.name,
        }
      : undefined
  );

  const filtered = leaderboardData.filter((item) => {
    const matchesSearch =
      item.username.toLowerCase().includes(search.toLowerCase()) ||
      (item.name && item.name.toLowerCase().includes(search.toLowerCase()));
    const matchesRank = filterRank === 'ALL' || item.rankName === filterRank;
    return matchesSearch && matchesRank;
  });

  const currentUserEntry = leaderboardData.find((item) => item.isCurrentUser);

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border-default)] pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-800 dark:text-amber-300 mb-2">
            <TrophyIcon className="w-3.5 h-3.5" />
            Papan Peringkat Belajar
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-display">
            Leaderboard Komputasi
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-xl leading-relaxed">
            Peringkat dihitung berdasarkan total akumulasi XP dari ketuntasan latihan, jejak eksekusi materi, dan konsistensi streak harian.
          </p>
        </div>

        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-mono font-medium text-[var(--text-primary)] hover:border-[var(--border-focused)] transition-colors text-decoration-none shrink-0"
        >
          ← Kembali ke Beranda
        </a>
      </div>

      {/* Current User Standing Callout (if active) */}
      {currentUserEntry && (
        <div className="p-4 sm:p-5 rounded-xl border border-[var(--accent-terracotta)]/40 bg-[var(--accent-terracotta)]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-terracotta)] text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              #{currentUserEntry.no}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[var(--text-primary)] font-display text-base">
                  {currentUserEntry.username}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[var(--accent-terracotta)] text-white">
                  Kamu
                </span>
              </div>
              <div className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Peringkat #{currentUserEntry.no} dari {leaderboardData.length} pembelajar
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Rank Saat Ini</span>
              <span className="font-bold text-[var(--accent-terracotta)]">{currentUserEntry.rankName}</span>
            </div>
            <div className="h-6 w-px bg-[var(--border-default)]"></div>
            <div>
              <span className="text-[var(--text-muted)] block text-[10px] uppercase">Total XP</span>
              <span className="font-extrabold text-[var(--text-primary)] text-sm">
                {currentUserEntry.totalXp.toLocaleString('id-ID')} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari username..."
            aria-label="Cari username pembelajar"
            className="w-full px-3.5 py-2 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--border-focused)] transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="filter-rank-select" className="text-xs font-mono text-[var(--text-muted)]">
            Tingkat:
          </label>
          <select
            id="filter-rank-select"
            value={filterRank}
            onChange={(e) => setFilterRank(e.target.value)}
            className="px-3 py-2 text-xs font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--border-focused)] transition-colors"
          >
            <option value="ALL">Semua Rank</option>
            <option value="Immortal">Immortal (2001+)</option>
            <option value="Grandmaster">Grandmaster (1001-2000)</option>
            <option value="Master">Master (701-1000)</option>
            <option value="Heroic">Heroic (501-700)</option>
            <option value="Diamond">Diamond (301-500)</option>
            <option value="Gold II">Gold II (201-300)</option>
            <option value="Gold I">Gold I (101-200)</option>
            <option value="Bronze II">Bronze II (51-100)</option>
            <option value="Bronze I">Bronze I (0-50)</option>
          </select>
        </div>
      </div>

      {/* Table: no | username | nama rank | xp total */}
      <div className="border border-[var(--border-default)] rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-secondary)] text-xs font-mono uppercase tracking-wider">
                <th scope="col" className="py-3 px-4 w-16 text-center font-semibold">
                  No
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Username
                </th>
                <th scope="col" className="py-3 px-4 font-semibold">
                  Nama Rank
                </th>
                <th scope="col" className="py-3 px-4 text-right font-semibold">
                  XP Total
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-default)] text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
                    Tidak ditemukan pembelajar yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => {
                  const isTop1 = row.no === 1;
                  const isTop2 = row.no === 2;
                  const isTop3 = row.no === 3;

                  return (
                    <tr
                      key={row.username}
                      className={`transition-colors ${
                        row.isCurrentUser
                          ? 'bg-[var(--accent-terracotta)]/10 font-medium'
                          : 'hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      {/* Column: No */}
                      <td className="py-3.5 px-4 text-center font-mono text-xs">
                        {isTop1 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                            1
                          </span>
                        ) : isTop2 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                            2
                          </span>
                        ) : isTop3 ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-400 font-bold">
                            3
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">{row.no}</span>
                        )}
                      </td>

                      {/* Column: Username */}
                      <td className="py-3.5 px-4 font-display">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[var(--text-primary)]">
                            {row.username}
                          </span>
                          {row.isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[var(--accent-terracotta)] text-white">
                              Kamu
                            </span>
                          )}
                        </div>
                        {row.name && (
                          <div className="text-xs text-[var(--text-muted)] font-mono">
                            {row.name}
                          </div>
                        )}
                      </td>

                      {/* Column: Nama Rank */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <span className="inline-block px-2.5 py-0.5 rounded font-semibold text-[var(--text-primary)] bg-[var(--bg-subtle)] border border-[var(--border-default)]">
                          {row.rankName}
                        </span>
                      </td>

                      {/* Column: XP Total */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[var(--text-primary)]">
                        {row.totalXp.toLocaleString('id-ID')}{' '}
                        <span className="text-xs font-normal text-[var(--text-muted)]">XP</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
