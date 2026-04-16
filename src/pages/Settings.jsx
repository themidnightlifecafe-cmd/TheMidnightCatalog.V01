import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Monitor, Trash2, LogOut, AlertTriangle, User, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const THEME_OPTIONS = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'light', label: 'Light', icon: Sun },
];

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    prefersDark ? root.classList.add('dark') : root.classList.remove('dark');
  }
  localStorage.setItem('theme', theme);
}

export default function Settings() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleting, setDeleting] = useState(false);

  const handleThemeChange = (value) => {
    setTheme(value);
    applyTheme(value);
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 1) { setDeleteStep(2); return; }
    setDeleting(true);
    try {
      // Delete all user data across entities
      const [books, notes, quotes, reviews, updates] = await Promise.all([
        base44.entities.Book.list(),
        base44.entities.ReadingNote.list(),
        base44.entities.Quote.list(),
        base44.entities.BookReview.list(),
        base44.entities.SocialUpdate.list(),
      ]);
      await Promise.all([
        ...books.map(b => base44.entities.Book.delete(b.id)),
        ...notes.map(n => base44.entities.ReadingNote.delete(n.id)),
        ...quotes.map(q => base44.entities.Quote.delete(q.id)),
        ...reviews.filter(r => r.reviewer_name === user?.full_name).map(r => base44.entities.BookReview.delete(r.id)),
        ...updates.filter(u => u.user_name === user?.full_name).map(u => base44.entities.SocialUpdate.delete(u.id)),
      ]);
      logout();
    } catch (e) {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-heading font-bold flex items-center gap-2 text-base">
          <User className="w-4 h-4 text-primary" /> Account
        </h2>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.full_name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.full_name || 'Guest'}</p>
            <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full gap-2" onClick={() => logout()}>
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </section>

      {/* Theme */}
      <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-heading font-bold flex items-center gap-2 text-base">
          <Palette className="w-4 h-4 text-primary" /> Appearance
        </h2>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleThemeChange(value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                theme === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5 space-y-3">
        <h2 className="font-heading font-bold flex items-center gap-2 text-base text-destructive">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h2>
        <p className="text-sm text-muted-foreground">
          Deleting your account permanently removes all your books, notes, quotes, and activity. This cannot be undone.
        </p>

        <AnimatePresence mode="wait">
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-3 p-4 rounded-xl border border-destructive/40 bg-destructive/10"
            >
              {deleteStep === 1 && (
                <>
                  <p className="text-sm font-medium text-destructive">Are you sure you want to delete your account?</p>
                  <p className="text-xs text-muted-foreground">All your data including books, notes, and reading history will be permanently deleted.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowDeleteConfirm(false); setDeleteStep(1); }}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" onClick={handleDeleteAccount}>
                      Continue
                    </Button>
                  </div>
                </>
              )}
              {deleteStep === 2 && (
                <>
                  <p className="text-sm font-medium text-destructive">Final confirmation — this is permanent.</p>
                  <p className="text-xs text-muted-foreground">Your account and all associated data will be deleted immediately.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => { setShowDeleteConfirm(false); setDeleteStep(1); }}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1" disabled={deleting} onClick={handleDeleteAccount}>
                      {deleting ? 'Deleting...' : 'Delete Everything'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <p className="text-xs text-center text-muted-foreground pb-4">
        The Midnight Life Cafe · v1.0.0
      </p>
    </div>
  );
}