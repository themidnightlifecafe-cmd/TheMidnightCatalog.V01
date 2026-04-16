import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BookOpen, Star, MessageCircle, TrendingUp, Check, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import CommentSection from './CommentSection';

const UPDATE_CONFIG = {
  started: { label: 'started reading', icon: BookOpen, color: 'text-primary bg-primary/10' },
  finished: { label: 'finished', icon: Check, color: 'text-secondary bg-secondary/10' },
  progress: { label: 'made progress on', icon: TrendingUp, color: 'text-accent bg-accent/10' },
  recommendation: { label: 'recommends', icon: Star, color: 'text-chart-4 bg-chart-4/10' },
  review: { label: 'reviewed', icon: Star, color: 'text-chart-4 bg-chart-4/10' },
};

function ActivityItem({ update }) {
  const [showComments, setShowComments] = useState(false);
  const cfg = UPDATE_CONFIG[update.update_type] || UPDATE_CONFIG.started;
  const Icon = cfg.icon;

  return (
    <div className="flex gap-3 p-4 rounded-2xl border border-border bg-card">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
        {(update.user_name || '?')[0].toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm">
            <span className="font-semibold">{update.user_name || 'Someone'}</span>
            <span className="text-muted-foreground"> {cfg.label} </span>
            <span className="font-heading font-bold">{update.book_title}</span>
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
            {update.created_date ? formatDistanceToNow(new Date(update.created_date), { addSuffix: true }) : ''}
          </span>
        </div>

        {update.book_cover_url && (
          <div className="flex gap-3 mt-2">
            <img src={update.book_cover_url} alt={update.book_title} className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
            <div>
              {update.message && <p className="text-xs text-muted-foreground italic">"{update.message}"</p>}
              {update.progress_percent > 0 && (
                <div className="mt-1.5">
                  <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${update.progress_percent}%` }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{update.progress_percent}% done</span>
                </div>
              )}
              {update.rating > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn('w-3 h-3', i < update.rating ? 'fill-chart-4 text-chart-4' : 'text-border')} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!update.book_cover_url && update.message && (
          <p className="text-xs text-muted-foreground italic mt-1">"{update.message}"</p>
        )}

        <button
          onClick={() => setShowComments(v => !v)}
          className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {showComments ? 'Hide comments' : 'Comment'}
        </button>

        {showComments && (
          <div className="mt-2">
            <CommentSection parentId={update.id} parentType="social_update" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function FriendActivityFeed() {
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['social-updates'],
    queryFn: () => base44.entities.SocialUpdate.list('-created_date', 20),
  });

  if (isLoading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />)}
    </div>
  );

  if (!updates.length) return (
    <div className="text-center py-12 text-muted-foreground text-sm border border-dashed rounded-2xl">
      No activity yet — share what you're reading!
    </div>
  );

  return (
    <div className="space-y-3">
      {updates.map(u => <ActivityItem key={u.id} update={u} />)}
    </div>
  );
}