import { describe, it, expect } from 'vitest';
import { getRankInfo } from '../src/lib/ranks';

describe('Rank System Tier Calculations', () => {
  it('correctly categorizes Bronze I (0 - 50 XP)', () => {
    expect(getRankInfo(0).tier).toBe('Bronze I');
    expect(getRankInfo(25).tier).toBe('Bronze I');
    expect(getRankInfo(50).tier).toBe('Bronze I');
  });

  it('correctly categorizes Bronze II (51 - 100 XP)', () => {
    expect(getRankInfo(51).tier).toBe('Bronze II');
    expect(getRankInfo(75).tier).toBe('Bronze II');
    expect(getRankInfo(100).tier).toBe('Bronze II');
  });

  it('correctly categorizes Gold I (101 - 200 XP)', () => {
    expect(getRankInfo(101).tier).toBe('Gold I');
    expect(getRankInfo(150).tier).toBe('Gold I');
    expect(getRankInfo(200).tier).toBe('Gold I');
  });

  it('correctly categorizes Gold II (201 - 300 XP)', () => {
    expect(getRankInfo(201).tier).toBe('Gold II');
    expect(getRankInfo(250).tier).toBe('Gold II');
    expect(getRankInfo(300).tier).toBe('Gold II');
  });

  it('correctly categorizes Diamond (301 - 500 XP)', () => {
    expect(getRankInfo(301).tier).toBe('Diamond');
    expect(getRankInfo(400).tier).toBe('Diamond');
    expect(getRankInfo(500).tier).toBe('Diamond');
  });

  it('correctly categorizes Heroic (501 - 700 XP)', () => {
    expect(getRankInfo(501).tier).toBe('Heroic');
    expect(getRankInfo(600).tier).toBe('Heroic');
    expect(getRankInfo(700).tier).toBe('Heroic');
  });

  it('correctly categorizes Master (701 - 1000 XP)', () => {
    expect(getRankInfo(701).tier).toBe('Master');
    expect(getRankInfo(850).tier).toBe('Master');
    expect(getRankInfo(1000).tier).toBe('Master');
  });

  it('correctly categorizes Grandmaster (1001 - 2000 XP)', () => {
    expect(getRankInfo(1001).tier).toBe('Grandmaster');
    expect(getRankInfo(1500).tier).toBe('Grandmaster');
    expect(getRankInfo(2000).tier).toBe('Grandmaster');
  });

  it('correctly categorizes Immortal (2001+ XP)', () => {
    expect(getRankInfo(2001).tier).toBe('Immortal');
    expect(getRankInfo(3500).tier).toBe('Immortal');
    expect(getRankInfo(99999).tier).toBe('Immortal');
    expect(getRankInfo(2001).nextRank).toBeNull();
  });

  it('handles negative XP defensively by clamping to 0 (Bronze I)', () => {
    expect(getRankInfo(-10).tier).toBe('Bronze I');
    expect(getRankInfo(-10).currentXp).toBe(0);
  });

  it('calculates XP needed for next rank correctly', () => {
    const info = getRankInfo(45); // Bronze I, next is Bronze II at 51
    expect(info.nextRank?.tier).toBe('Bronze II');
    expect(info.xpNeededForNext).toBe(6);
  });
});
