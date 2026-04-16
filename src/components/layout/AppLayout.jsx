import { Outlet, Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, Users, MapPin, Library, NotebookPen, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import PixelSprites from '@/components/PixelSprites';
import { AnimatePresence, motion } from 'framer-motion';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/library', icon: Library, label: 'My Library' },
  { path: '/journal', icon: NotebookPen, label: 'Journal' },
  { path: '/recommendations', icon: Sparkles, label: 'For You' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/social', icon: Users, label: 'Friends' },
  { path: '/bookstores', icon: MapPin, label: 'Bookstores' },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <PixelSprites />
      {/* Desktop Sidebar */}
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
          {navItems.map((item) => {
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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 px-2 pb-safe">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "scale-110")} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
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