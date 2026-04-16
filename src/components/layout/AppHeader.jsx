import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Root paths that show the logo instead of a back button
const ROOT_PATHS = ['/', '/library', '/journal', '/recommendations', '/challenges', '/social', '/bookstores', '/evening-latte', '/midnight-library', '/settings'];

export default function AppHeader({ title, className }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRoot = ROOT_PATHS.includes(location.pathname);

  if (isRoot) return null;

  return (
    <header className={cn(
      "sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border md:hidden",
      className
    )}>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-11 h-11 -ml-2 rounded-xl hover:bg-muted transition-colors text-foreground"
        aria-label="Go back"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {title && <h1 className="font-heading font-bold text-base truncate">{title}</h1>}
    </header>
  );
}