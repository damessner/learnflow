export function isStandalone(): boolean {
  return (
    import.meta.env.VITE_STANDALONE === 'true' ||
    window.location.hostname.includes('github.io') ||
    window.location.pathname.includes('learnflow_lite') ||
    window.location.href.includes('standalone')
  );
}

/**
 * In standalone/GitHub Pages mode, seed a guest student session into
 * localStorage so the router auth-guard lets pupils through without
 * a real login screen.
 */
export function bootstrapStandaloneSession(): void {
  if (!isStandalone()) return;
  if (localStorage.getItem('user')) return; // already set

  const guestUser = {
    id: 'standalone-guest',
    name: 'Student',
    role: 'student',
    isGuest: true,
    character_emoji: '🎓',
    isStandalone: true,
  };
  localStorage.setItem('user', JSON.stringify(guestUser));
}
