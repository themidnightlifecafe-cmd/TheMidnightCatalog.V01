import { useState } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, Star, Check, Bookmark } from 'lucide-react';

const statusConfig = {
  reading: { label: 'Reading', icon: BookOpen, color: 'bg-primary text-primary-foreground' },
  completed: { label: 'Finished', icon: Check, color: 'bg-secondary text-secondary-foreground' },
  want_to_read: { label: 'Want to Read', icon: Bookmark, color: 'bg-accent text-accent-foreground' },
};

export default function BookCard({ book, onClick, onUpdateProgress, variant = 'default' }) {
  const status = statusConfig[book.status] || statusConfig.want_to_read;
  const StatusIcon = status.icon;
  const progress = book.total_pages ? Math.round((book.current_page / book.total_pages) * 100) : 0;

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [inputMode, setInputMode] = useState('page'); // 'page' | 'percent'

  const handleProgressClick = (e) => {
    e.stopPropagation();
    setInputVal('');
    setEditing(true);
  };

  const handleSave = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const num = parseInt(inputVal, 10);
    if (isNaN(num)) { setEditing(false); return; }
    let newPage = num;
    if (inputMode === 'percent') {
      newPage = book.total_pages ? Math.round((num / 100) * book.total_pages) : 0;
    }
    newPage = Math.max(0, Math.min(newPage, book.total_pages || newPage));
    onUpdateProgress?.(book.id, newPage);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSave(e);
    if (e.key === 'Escape') { e.stopPropagation(); setEditing(false); }
  };

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
    <div className="group relative rounded-2xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 text-left">
      {/* Cover — clickable */}
      <button onClick={() => onClick?.(book)} className="block w-full">
        <div className="aspect-[2/3] bg-muted overflow-hidden">
          {book.cover_url ? (
            <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
              <BookOpen className="w-10 h-10 text-primary/30" />
            </div>
          )}
        </div>
      </button>

      <div className="p-3">
        <button onClick={() => onClick?.(book)} className="block w-full text-left">
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
        </button>

        {book.status === 'reading' && (
          <div className="mt-2">
            {/* Progress bar */}
            <div
              className="w-full h-2 bg-border rounded-full overflow-hidden cursor-pointer"
              onClick={handleProgressClick}
              title="Click to update progress"
            >
              <div className="h-full bg-secondary rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>

            {/* Inline editor */}
            {editing ? (
              <div className="mt-1.5 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <input
                  autoFocus
                  type="number"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={inputMode === 'page' ? `/ ${book.total_pages}` : '%'}
                  className="w-16 text-xs border border-primary rounded px-1.5 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground"
                  onClick={(e) => { e.stopPropagation(); setInputMode(m => m === 'page' ? 'percent' : 'page'); }}
                >
                  {inputMode === 'page' ? 'pg' : '%'}
                </button>
                <button
                  onClick={handleSave}
                  className="text-[10px] px-2 py-0.5 rounded bg-primary text-primary-foreground font-semibold"
                >
                  ✓
                </button>
              </div>
            ) : (
              <p
                className="text-[10px] text-muted-foreground mt-1 cursor-pointer hover:text-primary transition-colors"
                onClick={handleProgressClick}
                title="Click to update progress"
              >
                {book.current_page} / {book.total_pages} pages · {progress}%
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}