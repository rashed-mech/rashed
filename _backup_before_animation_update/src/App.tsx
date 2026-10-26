import React, { lazy, Suspense, useState, useEffect } from 'react';
import { 
  fetchPortfolioData, 
  isAdminLoggedIn, 
  fetchAdminData,
  removeAuthToken
} from './api';
import { PortfolioData } from './types';
import { formatImageUrl } from './utils/formatUrl';
import { ToastProvider } from './context/ToastContext';
import portfolioSeedData from '../data/portfolio_db.json';
const ReferencePortfolio = lazy(() => import('./components/ReferencePortfolio').then(module => ({ default: module.ReferencePortfolio })));
const OriginalPortfolio = lazy(() => import('./components/OriginalPortfolio').then(module => ({ default: module.OriginalPortfolio })));

const CACHE_KEY = 'portfolio_data_cache_v2';
const AdminLogin = lazy(() => import('./components/admin/AdminLogin').then(module => ({ default: module.AdminLogin })));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const CommandPalette = lazy(() => import('./components/CommandPalette').then(module => ({ default: module.CommandPalette })));
const adminLoading = <div className="min-h-screen flex items-center justify-center dark:bg-[#0c110f] dark:text-white" role="status">Loading dashboard…</div>;

function getInitialPortfolioData(): PortfolioData {
  try {
    // Purge outdated v1 cache that might contain old demo data
    localStorage.removeItem('portfolio_data_cache_v1');
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.profile && parsed.publications) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read portfolio cache from localStorage', e);
  }
  return portfolioSeedData as unknown as PortfolioData;
}

export function App() {
  const [data, setData] = useState<PortfolioData>(() => getInitialPortfolioData());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
  const loadData = async () => {
    try {
      setError(null);
      if (isAdminLoggedIn()) {
        try {
          const adminData = await fetchAdminData();
          setData(adminData);
          setIsAuth(true);
          return;
        } catch (adminErr) {
          console.warn('Admin session expired or invalid, falling back to public data:', adminErr);
          removeAuthToken();
          setIsAuth(false);
        }
      }
      
      const publicData = await fetchPortfolioData();
      
      setData(prev => {
        if (prev && JSON.stringify(prev) === JSON.stringify(publicData)) {
          return prev;
        }
        return publicData;
      });
      setIsAuth(false);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(publicData));
      } catch (e) {
        // Ignored if storage is blocked/full
      }
    } catch (err: any) {
      console.error('Failed to load portfolio data:', err);
      // Only block UI with error if we don't have any cached data to display
      setData(prev => {
        if (!prev) {
          setError(err.message || 'Failed to load portfolio data');
        }
        return prev;
      });
    } finally {
      setLoading(false);
    }
  };

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
    const updateFaviconLinks = (iconHref: string) => {
      const links = document.querySelectorAll("link[rel*='icon']") as NodeListOf<HTMLLinkElement>;
      if (links.length === 0) {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = iconHref;
        document.head.appendChild(link);
      } else {
        links.forEach((l) => {
          l.href = iconHref;
        });
      }
    };

    const logo = data?.profile?.logoUrl;
    if (logo && logo !== 'chunked' && logo.trim().length > 0 && logo !== '/api/portfolio/logo' && !logo.includes('1RsbjbZ3fzL7LmoMNWoQ8aimuNalcNT1H')) {
      const formatted = formatImageUrl(logo) || logo;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const size = 128;
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, size, size);
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2 - 4, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 4, 4, size - 8, size - 8);
            ctx.strokeStyle = '#2dd4bf';
            ctx.lineWidth = 4;
            ctx.stroke();
            const dataUrl = canvas.toDataURL('image/png');
            updateFaviconLinks(dataUrl);
          } else {
            updateFaviconLinks('/favicon-32x32.png?v=6');
          }
        } catch {
          updateFaviconLinks('/favicon-32x32.png?v=6');
        }
      };
      img.onerror = () => {
        updateFaviconLinks('/favicon-32x32.png?v=6');
      };
      img.src = formatted;
    } else {
      updateFaviconLinks('/favicon-32x32.png?v=6');
    }
  }, [data?.profile?.logoUrl]);

  useEffect(() => {
    // Browser tab title.
    const defaultSiteTitle = "Rashedul Islam | Mechanical Engineer";
    if (data?.profile?.siteTitle && data.profile.siteTitle.includes("|")) {
      document.title = data.profile.siteTitle.trim();
    } else {
      document.title = defaultSiteTitle;
    }
  }, [data?.profile?.siteTitle]);

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
