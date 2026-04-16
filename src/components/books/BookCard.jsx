import { cn } from '@/lib/utils';
import { BookOpen, Star, Check, Bookmark } from 'lucide-react';

const statusConfig = {
  reading: { label: 'Reading', icon: BookOpen, color: 'bg-primary text-primary-foreground' },
  completed: { label: 'Finished', icon: Check, color: 'bg-secondary text-secondary-foreground' },
  want_to_read: { label: 'Want to Read', icon: Bookmark, color: 'bg-accent text-accent-foreground' },
};

export default function BookCard({ book, onClick, variant = 'default' }) {
  const status = statusConfig[book.status] || statusConfig.want_to_read;
  const StatusIcon = status.icon;
  const progress = book.total_pages ? Math.round((book.current_page / book.total_pages) * 100) : 0;

  if (variant === 'compact') {
    return (
      <button onClick={() => onClick?.(book)} className="flex gap-3 p-3 rounded-xl hover:bg-muted/60 transition-all text-left w-full group">
        <div className="w-12 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary/50" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{book.title}</p>
          <p className="text-xs text-muted-foreground truncate">{book.author}</p>
          {book.status === 'reading' && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{progress}%</span>
            </div>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => onClick?.(book)}
      className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 text-left"
    >
      <div className="aspect-[2/3] bg-muted overflow-hidden">
        {book.cover_url ? (
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <BookOpen className="w-10 h-10 text-primary/30" />
          </div>
        )}
      </div>
      <div className="p-3">
        <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold mb-2", status.color)}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </div>
        <h3 className="font-heading text-sm font-bold leading-tight line-clamp-2">{book.title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        {book.rating > 0 && (
          <div className="flex items-center gap-0.5 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn("w-3 h-3", i < book.rating ? "fill-chart-4 text-chart-4" : "text-border")} />
            ))}
          </div>
        )}
        {book.status === 'reading' && (
          <div className="mt-2">
            <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">{book.current_page} / {book.total_pages} pages</p>
          </div>
        )}
      </div>
    </button>
  );
}