import { Star, Plus, Check, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MATCH_LABELS = {
  similar_to_loved: { label: 'Similar to loved', color: 'bg-purple-100 text-purple-700' },
  favorite_genre: { label: 'Your genre', color: 'bg-blue-100 text-blue-700' },
  surprise_pick: { label: 'Surprise pick', color: 'bg-orange-100 text-orange-700' },
};

export default function RecommendationCard({ rec, isAdded, onAdd }) {
  const matchCfg = MATCH_LABELS[rec.match_reason];

  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow">
      {/* Cover */}
      <div className="w-16 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {rec.cover_url ? (
          <img
            src={rec.cover_url}
            alt={rec.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="w-full h-full hidden items-center justify-center bg-primary/10">
          <BookOpen className="w-6 h-6 text-primary/30" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {matchCfg && (
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mb-1', matchCfg.color)}>
              {matchCfg.label}
            </span>
          )}
          <h3 className="font-heading font-bold text-sm leading-tight line-clamp-2">{rec.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{rec.author}</p>

          {rec.genre && (
            <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full inline-block mt-1">
              {rec.genre}
            </span>
          )}

          {rec.estimated_rating && (
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn('w-3 h-3', i < Math.round(rec.estimated_rating) ? 'fill-chart-4 text-chart-4' : 'text-border')}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-0.5">{rec.estimated_rating}/5 predicted</span>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{rec.description}</p>

          {rec.reason && (
            <p className="text-[11px] text-primary/80 italic mt-1 line-clamp-2">"{rec.reason}"</p>
          )}
        </div>

        <Button
          size="sm"
          variant={isAdded ? 'secondary' : 'default'}
          className={cn('mt-2 h-7 text-xs gap-1 self-start', isAdded && 'text-secondary')}
          onClick={onAdd}
          disabled={isAdded}
        >
          {isAdded ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add to Library</>}
        </Button>
      </div>
    </div>
  );
}