import React, { lazy, Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { 
  fetchPortfolioData, 
  isAdminLoggedIn, 
  fetchAdminData,
  removeAuthToken,
  syncScholarCitations
} from './api';
import { PortfolioData } from './types';
import { ToastProvider } from './context/ToastContext';
import portfolioSeedData from '../data/portfolio_db.json';
import { publicationStats } from './utils/publicationStats';
const ReferencePortfolio = lazy(() => import('./components/ReferencePortfolio').then(module => ({ default: module.ReferencePortfolio })));
const OriginalPortfolio = lazy(() => import('./components/OriginalPortfolio').then(module => ({ default: module.OriginalPortfolio })));

const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(module => ({ default: module.CommandPalette })));
const adminLoading = <div className="min-h-screen flex items-center justify-center dark:bg-[#0c110f] dark:text-white" role="status">Loading dashboard…</div>;

function getInitialPortfolioData(): PortfolioData {
  try {
    // Purge outdated v1 cache that might contain old demo data
    localStorage.removeItem('portfolio_data_cache_v1');
    localStorage.removeItem('portfolio_data_cache_v2');
  } catch (e) {
    console.warn('Failed to read portfolio cache from localStorage', e);
  }
  const seed = structuredClone(portfolioSeedData) as unknown as PortfolioData;
  Object.assign(seed.profile.stats, publicationStats(seed.publications));
  return seed;
}

export function App() {
  const [data, setData] = useState<PortfolioData>(() => getInitialPortfolioData());
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // True once the API has answered at least once. A later background refresh that
  // fails must not put a warning banner on a page that is already showing fine.
  const hasLoadedOnce = useRef(false);
  const [route, setRoute] = useState<'home' | 'admin'>(() => {
    return window.location.pathname.startsWith('/admin') ? 'admin' : 'home';
  });
  const [isAuth, setIsAuth] = useState<boolean>(isAdminLoggedIn());
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('portfolio_theme');
      if (saved) return saved === 'dark';
    } catch (e) {}
    return true; // Default to modern dark mode
  });
  const activeDesign = data.themeUX?.activeDesign || 'design-5';

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_theme', darkMode ? 'dark' : 'light');
    } catch (e) {}

    if (darkMode && (route === 'admin' || activeDesign !== 'design-7')) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode, route, activeDesign]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Load portfolio data
  const pendingLoad = useRef<Promise<void> | null>(null);
  const loadData = useCallback((): Promise<void> => {
    if (pendingLoad.current) return pendingLoad.current;
    const request = (async () => {
      try {
        if (isAdminLoggedIn()) {
          try {
            const adminData = await fetchAdminData();
            setData(adminData);
            setIsAuth(true);
            hasLoadedOnce.current = true;
            setError(null);
            return;
          } catch (adminErr) {
            if (isAdminLoggedIn()) throw adminErr;
            console.warn('Admin session expired or invalid, falling back to public data:', adminErr);
            removeAuthToken();
            setIsAuth(false);
          }
        }

        // A cold serverless start can fail once and succeed a moment later, so retry
        // quietly before telling the visitor anything.
        let publicData: PortfolioData | null = null;
        for (let attempt = 0; attempt < 3 && !publicData; attempt++) {
          try {
            publicData = await fetchPortfolioData();
          } catch (attemptErr) {
            if (attempt === 2) throw attemptErr;
            await new Promise(resolve => setTimeout(resolve, 1200 * (attempt + 1)));
          }
        }
        setData(prev => JSON.stringify(prev) === JSON.stringify(publicData) ? prev : publicData!);
        setIsAuth(false);
        hasLoadedOnce.current = true;
        setError(null);
      } catch (err: any) {
        console.error('Failed to load portfolio data:', err);
        // Only warn if the visitor has never received live data.
        if (!hasLoadedOnce.current) {
          setError('Could not refresh the portfolio. Showing the last available snapshot.');
        }
      } finally {
        setLoading(false);
      }
    })();
    pendingLoad.current = request;
    void request.finally(() => { if (pendingLoad.current === request) pendingLoad.current = null; });
    return request;
  }, []);

  // Never leave the visitor on the spinner for more than a few seconds. The bundled
  // snapshot is already in state, so show it while the API wakes up.
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let started = false;
    const syncAfterLoad = async () => {
      if (started) return;
      started = true;
      await loadData();
      if (cancelled) return;
      // Scraping Google Scholar is slow and rate-limited, so it must never run for
      // ordinary visitors. Only the signed-in owner triggers it.
      if (!isAdminLoggedIn()) return;
      try {
        await syncScholarCitations();
        if (!cancelled) await loadData();
      } catch (err) {
        console.warn('Background citation sync failed; keeping saved counts:', err);
      }
    };
    const timer = document.readyState === 'complete' ? window.setTimeout(syncAfterLoad, 0) : undefined;
    window.addEventListener('load', syncAfterLoad, { once: true });
    // Live refresh is only useful while editing in the admin panel. Public visitors
    // already receive a cached copy, so polling would just hit the database.
    const refresh = () => { if (document.visibilityState === 'visible' && isAdminLoggedIn()) void loadData(); };
    const onStorage = (event: StorageEvent) => { if (event.key === 'portfolio_saved_at') refresh(); };
    const poll = window.setInterval(refresh, 30_000);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', onStorage);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearInterval(poll);
      window.removeEventListener('load', syncAfterLoad);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', onStorage);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [loadData]);

  useEffect(() => {
    loadData();

    // Listen to browser URL navigation (popstate)
    const handlePopState = () => {
      setRoute(window.location.pathname.startsWith('/admin') ? 'admin' : 'home');
      setIsAuth(isAdminLoggedIn());
    };

    // Keyboard shortcuts: Cmd+K / Ctrl+K for search, Ctrl+Shift+A for admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateTo('admin');
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // The static icons in index.html are the default favicon. Only a logo uploaded in the
    // admin panel (stored as a data URL) replaces them; remote logos are skipped because a
    // slow or blocked download used to leave the tab without any icon.
    const logo = data?.profile?.logoUrl;
    const existing = document.getElementById('custom-favicon');
    if (!logo || !logo.startsWith('data:image/')) {
      existing?.remove();
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 2, 2, size - 4, size - 4);
        const link = (existing as HTMLLinkElement | null) ?? document.createElement('link');
        link.id = 'custom-favicon';
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = canvas.toDataURL('image/png');
        // Appended last so browsers prefer it over the static icons.
        document.head.appendChild(link);
      } catch {
        // Keep the static icons.
      }
    };
    img.src = logo;
  }, [data?.profile?.logoUrl]);

  useEffect(() => {
    // Browser tab title.
    const defaultSiteTitle = "Rashedul Islam | Mechanical Engineer";
    if (data?.profile?.siteTitle && data.profile.siteTitle.includes("|")) {
      document.title = data.profile.siteTitle.trim();
    } else {
      document.title = defaultSiteTitle;
    }
  }, [data.profile.siteTitle]);

  const navigateTo = (newRoute: 'home' | 'admin') => {
    setRoute(newRoute);
    const path = newRoute === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsAuth(isAdminLoggedIn());
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-[#080d14] text-slate-100' : 'bg-[#E4E7EB] text-slate-900'}`}>
        <div className="text-center space-y-4 animate-page-smooth">
          <div className="w-10 h-10 border-2 border-indigo-600 dark:border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono tracking-widest uppercase text-slate-700 dark:text-amber-400">
            Loading Energy Systems Portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? 'bg-[#080d14]' : 'bg-[#E4E7EB]'}`}>
        <div className="max-w-md w-full bg-[#0e141a] rounded-2xl border border-red-800/80 p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-red-950/80 text-red-400 rounded-full flex items-center justify-center mx-auto text-lg font-mono">
            !
          </div>
          <h2 className="text-base font-bold text-white">Failed to connect to backend</h2>
          <p className="text-xs text-slate-300 font-light">{error || 'Unknown error occurred.'}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              loadData();
            }}
            className="px-4 py-2 bg-indigo-600 dark:bg-[#d4af37] text-white dark:text-[#0b0f12] text-xs font-mono font-bold rounded-xl"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Admin Route View (only visible when directly accessing /admin or via secret shortcut)
  if (route === 'admin') {
    if (!isAuth) {
      return (
        <Suspense fallback={adminLoading}><AdminLogin
          onLoginSuccess={() => {
            setIsAuth(true);
            loadData();
          }}
          onBackToSite={() => navigateTo('home')}
        /></Suspense>
      );
    }

    return (
      <Suspense fallback={adminLoading}><AdminDashboard
        data={data}
        onRefresh={loadData}
        onLogout={() => {
          setIsAuth(false);
          navigateTo('home');
        }}
        onViewLive={() => navigateTo('home')}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      /></Suspense>
    );
  }

  return (
    <ToastProvider>
      {error && <div role="status" className="bg-amber-50 p-2 text-center text-sm text-amber-900">{error}</div>}
      <Suspense fallback={<div className="min-h-screen" />}>
      {activeDesign === 'design-7' ? <ReferencePortfolio
        data={data}
        onSearch={() => setCommandPaletteOpen(true)}
        onAdmin={() => navigateTo('admin')}
        isAdmin={isAuth}
      /> : <OriginalPortfolio data={data} darkMode={darkMode} activeDesign={activeDesign} onToggleTheme={toggleDarkMode} onSearch={() => setCommandPaletteOpen(true)} onAdmin={() => navigateTo('admin')} isAdmin={isAuth} />}
      </Suspense>
      {commandPaletteOpen && <Suspense fallback={null}>
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          data={data}
          darkMode={activeDesign === 'design-7' ? false : darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenAdmin={() => navigateTo('admin')}
          sectionConfig={data.sectionConfig}
          isReferenceLayout={activeDesign === 'design-7'}
        />
      </Suspense>}
    </ToastProvider>
  );
}

export default App;
