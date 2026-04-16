import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Shuffle, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPIN_DURATION = 2500;

export default function TBRSpinner({ tbrBooks, onStartReading }) {
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState(null);
  const [displayBook, setDisplayBook] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const intervalRef = useRef(null);

  if (tbrBooks.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
        <Shuffle className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground font-medium">No TBR books yet!</p>
        <p className="text-sm text-muted-foreground mt-1">Add books to your Wishlist to use the spinner.</p>
      </div>
    );
  }

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setRevealed(false);
    setPicked(null);

    let elapsed = 0;
    const step = 120;
    intervalRef.current = setInterval(() => {
      elapsed += step;
      const rand = tbrBooks[Math.floor(Math.random() * tbrBooks.length)];
      setDisplayBook(rand);
      if (elapsed >= SPIN_DURATION) {
        clearInterval(intervalRef.current);
        const final = tbrBooks[Math.floor(Math.random() * tbrBooks.length)];
        setDisplayBook(final);
        setPicked(final);
        setSpinning(false);
        setTimeout(() => setRevealed(true), 200);
      }
    }, step);
  };

  const book = spinning ? displayBook : picked;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-heading text-xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> What Should I Read Next?
        </h2>
        <p className="text-sm text-muted-foreground">Spin the wheel and let fate decide your next read!</p>
      </div>

      {/* Slot machine display */}
      <div className={cn(
        "relative mx-auto max-w-xs rounded-2xl border-2 p-6 text-center transition-all duration-300 overflow-hidden",
        spinning ? "border-primary bg-primary/5 shadow-lg shadow-primary/20" : picked ? "border-secondary bg-secondary/5" : "border-border bg-muted/30"
      )}>
        {/* Scanline effect when spinning */}
        {spinning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute inset-x-0 h-8 bg-primary/10 animate-bounce" style={{ top: '40%' }} />
          </div>
        )}

        {book ? (
          <div className={cn("transition-all duration-200", spinning ? "blur-[1px] scale-95" : "blur-0 scale-100")}>
            <div className="w-20 h-28 mx-auto rounded-lg overflow-hidden bg-muted mb-4 shadow-md">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <BookOpen className="w-8 h-8 text-primary/40" />
                </div>
              )}
            </div>
            <p className={cn("font-heading font-bold text-base leading-tight transition-all duration-300", spinning ? "opacity-60" : "opacity-100")}>
              {book.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
            {book.genre && <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{book.genre}</span>}
          </div>
        ) : (
          <div className="py-6">
            <div className="w-20 h-28 mx-auto rounded-lg bg-muted mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground text-sm">Your next book will appear here</p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col items-center gap-3">
        <Button
          onClick={spin}
          disabled={spinning}
          size="lg"
          className={cn("gap-2 px-8 transition-all", spinning ? "animate-pulse" : "")}
        >
          <Shuffle className={cn("w-4 h-4", spinning && "animate-spin")} />
          {spinning ? "Spinning..." : picked ? "Spin Again!" : "Spin the Wheel!"}
        </Button>

        {revealed && picked && (
          <Button
            variant="outline"
            className="gap-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
            onClick={() => onStartReading(picked)}
          >
            <ArrowRight className="w-4 h-4" />
            Start Reading "{picked.title}"
          </Button>
        )}
      </div>

      {/* TBR list below */}
      <div className="mt-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Your TBR List ({tbrBooks.length} books)
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {tbrBooks.map((b) => (
            <div
              key={b.id}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl transition-all",
                picked?.id === b.id ? "bg-secondary/10 border border-secondary/30" : "bg-muted/40 hover:bg-muted/70"
              )}
            >
              <div className="w-8 h-11 rounded-md overflow-hidden bg-muted flex-shrink-0">
                {b.cover_url ? (
                  <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{b.title}</p>
                <p className="text-xs text-muted-foreground truncate">{b.author}</p>
              </div>
              {picked?.id === b.id && (
                <Sparkles className="w-4 h-4 text-secondary flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}