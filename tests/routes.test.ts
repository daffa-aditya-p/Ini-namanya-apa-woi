import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Route Separation & Dedicated Page Architecture', () => {
  const pagesDir = path.resolve(process.cwd(), 'src/pages');

  it('verifies / (index.astro) is purely a landing page and never imports Dashboard directly', () => {
    const indexPath = path.join(pagesDir, 'index.astro');
    expect(fs.existsSync(indexPath)).toBe(true);
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Index page must mount HomeApp, not Dashboard
    expect(content).toContain('HomeApp');
    expect(content).not.toContain('import { Dashboard }');
  });

  it('verifies /dashboard (dashboard.astro) exists as a dedicated independent route', () => {
    const dashboardPath = path.join(pagesDir, 'dashboard.astro');
    expect(fs.existsSync(dashboardPath)).toBe(true);
    const content = fs.readFileSync(dashboardPath, 'utf-8');

    expect(content).toContain('DashboardApp');
  });

  it('verifies standalone dedicated auth routes (/login, /register, /forgot-password)', () => {
    const loginPath = path.join(pagesDir, 'login.astro');
    const registerPath = path.join(pagesDir, 'register.astro');
    const forgotPath = path.join(pagesDir, 'forgot-password.astro');

    expect(fs.existsSync(loginPath)).toBe(true);
    expect(fs.existsSync(registerPath)).toBe(true);
    expect(fs.existsSync(forgotPath)).toBe(true);

    const loginContent = fs.readFileSync(loginPath, 'utf-8');
    const registerContent = fs.readFileSync(registerPath, 'utf-8');
    const forgotContent = fs.readFileSync(forgotPath, 'utf-8');

    expect(loginContent).toContain('AuthFormCard');
    expect(registerContent).toContain('AuthFormCard');
    expect(forgotContent).toContain('AuthFormCard');
  });

  it('verifies HomeApp includes platform showcase, tracks, and interactive preview', () => {
    const homeAppPath = path.resolve(process.cwd(), 'src/components/HomeApp.tsx');
    expect(fs.existsSync(homeAppPath)).toBe(true);
    const content = fs.readFileSync(homeAppPath, 'utf-8');

    // Must not directly replace page with Dashboard when user is logged in
    expect(content).not.toMatch(/if\s*\(user\)\s*\{\s*return\s*\(?\s*<div[^>]*>\s*<Dashboard/);

    // Must have Interactive Preview
    expect(content).toContain('Interactive Preview');
    expect(content).toContain('CodePlayground');

    // Must link to curriculum tracks
    expect(content).toContain('/curriculum/javascript/j1');
    expect(content).toContain('/curriculum/python/p1');

    // Must have CTAs linking to /dashboard when user is active
    expect(content).toContain('/dashboard');
  });

  it('verifies NavigationHeader displays quick status, streak, rank, and dashboard link when logged in or auth links when logged out', () => {
    const navPath = path.resolve(process.cwd(), 'src/components/NavigationHeader.tsx');
    expect(fs.existsSync(navPath)).toBe(true);
    const content = fs.readFileSync(navPath, 'utf-8');

    // Quick status items for logged in:
    expect(content).toContain('user.streak');
    expect(content).toContain('rank.tier');
    expect(content).toContain('user.username');
    expect(content).toContain('/dashboard');
    expect(content).toContain('handleLogout');

    // Auth links for logged out:
    expect(content).toContain('href="/login"');
    expect(content).toContain('href="/register"');
  });

  it('verifies DashboardApp protects /dashboard for guests with graceful prompt', () => {
    const dashPath = path.resolve(process.cwd(), 'src/components/DashboardApp.tsx');
    expect(fs.existsSync(dashPath)).toBe(true);
    const content = fs.readFileSync(dashPath, 'utf-8');

    // Guest prompt messaging and action buttons
    expect(content).toContain('Meja Kerja Memerlukan Akun');
    expect(content).toContain('href="/login"');
    expect(content).toContain('href="/register"');
    expect(content).toContain('handleDemoLogin');
  });

  it('verifies AuthFormCard has authentic routing links between auth pages', () => {
    const authPath = path.resolve(process.cwd(), 'src/components/AuthFormCard.tsx');
    expect(fs.existsSync(authPath)).toBe(true);
    const content = fs.readFileSync(authPath, 'utf-8');

    expect(content).toContain('href="/login"');
    expect(content).toContain('href="/register"');
    expect(content).toContain('href="/forgot-password"');
    expect(content).toContain('window.location.href = \'/dashboard\'');
  });
});
