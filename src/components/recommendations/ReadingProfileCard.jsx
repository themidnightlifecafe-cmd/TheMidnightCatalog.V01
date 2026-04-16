import { BookOpen, Star, TrendingUp, Tag } from 'lucide-react';

export default function ReadingProfileCard({ profile, books }) {
  if (!books.length) return null;

  const completed = books.filter(b => b.status === 'completed').length;
  const reading = books.filter(b => b.status === 'reading').length;
  const rated = books.filter(b => b.rating > 0);
  const avgRating = rated.length ? (rated.reduce((s, b) => s + b.rating, 0) / rated.length).toFixed(1) : '—';

  const genreCount = {};
  books.forEach(b => { if (b.genre) genreCount[b.genre] = (genreCount[b.genre] || 0) + 1; });
  const topGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="flex flex-col items-center text-center p-2">
        <BookOpen className="w-5 h-5 text-primary mb-1.5" />
        <p className="text-2xl font-heading font-bold">{books.length}</p>
        <p className="text-[11px] text-muted-foreground">Total books</p>
      </div>
      <div className="flex flex-col items-center text-center p-2">
        <TrendingUp className="w-5 h-5 text-secondary mb-1.5" />
        <p className="text-2xl font-heading font-bold">{completed}</p>
        <p className="text-[11px] text-muted-foreground">Completed</p>
      </div>
      <div className="flex flex-col items-center text-center p-2">
        <Star className="w-5 h-5 text-chart-4 mb-1.5" />
        <p className="text-2xl font-heading font-bold">{avgRating}</p>
        <p className="text-[11px] text-muted-foreground">Avg rating</p>
      </div>
      <div className="flex flex-col items-center text-center p-2">
        <Tag className="w-5 h-5 text-accent mb-1.5" />
        <div className="flex flex-wrap justify-center gap-1 mt-0.5">
          {topGenres.length ? topGenres.map(([g]) => (
            <span key={g} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{g}</span>
          )) : <p className="text-[11px] text-muted-foreground">No genres yet</p>}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">Top genres</p>
      </div>
    </div>
  );
}