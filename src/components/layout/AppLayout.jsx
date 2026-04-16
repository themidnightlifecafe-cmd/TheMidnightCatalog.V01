import { useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Library, NotebookPen, Sparkles, Users, MapPin, Trophy, Coffee, BookMarked, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import PixelSprites from '@/components/PixelSprites';
import { AnimatePresence, motion } from 'framer-motion';
import MobileMoreMenu from '@/components/layout/MobileMoreMenu';

// All nav items — used by the desktop sidebar
const allNavItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/library', icon: Library, label: 'My Library' },
  { path: '/journal', icon: NotebookPen, label: 'Journal' },
  { path: '/recommendations', icon: Sparkles, label: 'For You' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/social', icon: Users, label: 'Friends' },
  { path: '/bookstores', icon: MapPin, label: 'Bookstores' },
  { path: '/evening-latte', icon: Coffee, label: 'Evening Latte' },
  { path: '/midnight-library', icon: BookMarked, label: 'Midnight Library' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

// Exactly 5 primary tabs for iOS HIG bottom bar
const primaryTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/library', icon: Library, label: 'Library' },
  { path: '/journal', icon: NotebookPen, label: 'Journal' },
  { path: '/recommendations', icon: Sparkles, label: 'For You' },
  { path: '/social', icon: Users, label: 'Social' },
];

// Paths that belong to "More" overflow menu
const morePaths = ['/bookstores', '/challenges', '/evening-latte', '/midnight-library', '/settings'];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Track the last visited path per tab so we can reset on re-tap
  const tabRoots = useRef(
    Object.fromEntries(primaryTabs.map(t => [t.path, t.path]))
  );

  const handleTabPress = (tabPath) => {
    const isActive =
      location.pathname === tabPath ||
      (tabPath !== '/' && location.pathname.startsWith(tabPath + '/'));

    if (isActive) {
      // Re-tap: reset to root
      tabRoots.current[tabPath] = tabPath;
      navigate(tabPath, { replace: true });
    } else {
      // Navigate to last remembered path for this tab (or root)
      const dest = tabRoots.current[tabPath] || tabPath;
      navigate(dest);
    }
  };

  // Keep tabRoots up-to-date when navigating within a tab
  const activeTab = primaryTabs.find(t =>
    t.path === '/'
      ? location.pathname === '/'
      : location.pathname === t.path || location.pathname.startsWith(t.path + '/')
  );
  if (activeTab) {
    tabRoots.current[activeTab.path] = location.pathname;
  }

  const isMoreActive = morePaths.some(
    p => location.pathname === p || location.pathname.startsWith(p + '/')
  );

  return (
    <div className="min-h-screen bg-background">
      <PixelSprites />

      {/* ── Desktop Sidebar (unchanged) ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col border-r border-border bg-sidebar p-6 z-40">
        <Link to="/" className="flex items-center gap-3 mb-10">
          <img
            src="https://media.base44.com/images/public/69e02868450534511f604ccd/7a3d8777e_generated_image.png"
            alt="The Midnight Life Cafe owl"
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
          <span className="font-heading text-base font-bold text-foreground leading-tight">The Midnight Life Cafe</span>
        </Link>

        <nav className="flex flex-col gap-1.5 flex-1">
          {allNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground font-medium">Reading Goal</p>
          <p className="text-2xl font-heading font-bold text-foreground mt-1">12 / 24</p>
          <p className="text-xs text-muted-foreground">books this year</p>
          <div className="w-full h-2 bg-border rounded-full mt-2 overflow-hidden">
            <div className="h-full w-1/2 bg-secondary rounded-full" />
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Tab Bar (iOS HIG — 5 items) ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40">
        <div className="flex items-stretch justify-around px-1" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {primaryTabs.map((tab) => {
            const isActive =
              tab.path === '/'
                ? location.pathname === '/'
                : location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
            return (
              <button
                key={tab.path}
                onClick={() => handleTabPress(tab.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[56px] min-w-[44px] py-2 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <tab.icon className={cn("w-[22px] h-[22px] transition-transform", isActive && "scale-110")} />
                <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-primary" : "text-muted-foreground/80")}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More tab */}
          <MobileMoreMenu isActive={isMoreActive} />
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="min-h-screen"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}