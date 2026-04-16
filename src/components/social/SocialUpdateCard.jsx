import { Heart, BookOpen, Star, Trophy, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const typeConfig = {
  started: { icon: BookOpen, label: 'Started reading', color: 'text-primary' },
  finished: { icon: Trophy, label: 'Finished', color: 'text-secondary' },
  progress: { icon: Sparkles, label: 'Made progress on', color: 'text-chart-5' },
  recommendation: { icon: Heart, label: 'Recommends', color: 'text-accent' },
  review: { icon: Star, label: 'Reviewed', color: 'text-chart-4' },
};

export default function SocialUpdateCard({ update, onLike }) {
  const config = typeConfig[update.update_type] || typeConfig.progress;
  const Icon = config.icon;

  return (
    <div className="p-5 rounded-2xl bg-card border border-border hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">
            {(update.user_name || update.created_by || '?')[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{update.user_name || update.created_by}</span>
            <span className={cn("flex items-center gap-1 text-xs font-medium", config.color)}>
              <Icon className="w-3.5 h-3.5" />
              {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {update.created_date ? format(new Date(update.created_date), 'MMM d, yyyy') : ''}
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-4 p-3 rounded-xl bg-muted/40">
        {update.book_cover_url && (
          <img src={update.book_cover_url} alt="" className="w-12 h-16 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-heading font-bold text-sm">{update.book_title}</p>
          {update.book_author && <p className="text-xs text-muted-foreground">{update.book_author}</p>}
          {update.progress_percent > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden max-w-[120px]">
                <div className="h-full bg-primary rounded-full" style={{ width: `${update.progress_percent}%` }} />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">{update.progress_percent}%</span>
            </div>
          )}
          {update.rating > 0 && (
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("w-3 h-3", i < update.rating ? "fill-chart-4 text-chart-4" : "text-border")} />
              ))}
            </div>
          )}
        </div>
      </div>

      {update.message && (
        <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{update.message}</p>
      )}

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
        <button
          onClick={() => onLike?.(update)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors"
        >
          <Heart className="w-4 h-4" />
          <span>{update.likes || 0}</span>
        </button>
        <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
          <MessageCircle className="w-4 h-4" />
          Comment
        </button>
      </div>
    </div>
  );
}