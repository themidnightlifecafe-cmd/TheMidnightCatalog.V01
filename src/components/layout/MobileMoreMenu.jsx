import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Trophy, Coffee, BookMarked, Settings, MoreHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const moreItems = [
  { path: '/bookstores', icon: MapPin, label: 'Bookstores' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/evening-latte', icon: Coffee, label: 'Evening Latte' },
  { path: '/midnight-library', icon: BookMarked, label: 'Midnight Library' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function MobileMoreMenu({ isActive }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* More button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex flex-col items-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1.5 rounded-xl transition-all justify-center",
          isActive || open ? "text-primary" : "text-muted-foreground"
        )}
      >
        {open
          ? <X className="w-5 h-5" />
          : <MoreHorizontal className={cn("w-5 h-5", (isActive || open) && "scale-110")} />
        }
        <span className="text-[9px] font-medium">More</span>
      </button>

      {/* Slide-up tray */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-30 bg-black/40"
              onClick={() => setOpen(false)}
            />

            {/* Tray */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="fixed bottom-[64px] left-0 right-0 z-40 bg-card border-t border-border rounded-t-2xl px-6 pt-5 pb-8 safe-area-bottom"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-border rounded-full mx-auto mb-6" />

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">More</p>

              <div className="grid grid-cols-4 gap-3">
                {moreItems.map((item) => {
                  const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-h-[72px] justify-center",
                        active
                          ? "bg-primary/15 text-primary"
                          : "bg-muted/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="w-6 h-6" />
                      <span className="text-[10px] font-medium text-center leading-tight">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}