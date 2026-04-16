import { useState } from 'react';
import { Star, Heart, MessageCircle, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';

export default function ReviewCard({ review, currentUserEmail, onLike }) {
  const [showComments, setShowComments] = useState(false);
  const hasLiked = review.liked_by?.includes(currentUserEmail);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <div className="flex gap-3">
        {/* Cover */}
        <div className="w-12 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
          {review.book_cover_url
            ? <img src={review.book_cover_url} alt={review.book_title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-4 h-4 text-muted-foreground/40" /></div>
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading font-bold text-sm leading-tight">{review.book_title}</h3>
              {review.book_author && <p className="text-xs text-muted-foreground">{review.book_author}</p>}
            </div>
            {review.club_name && (
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">{review.club_name}</span>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mt-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('w-3 h-3', i < review.rating ? 'fill-chart-4 text-chart-4' : 'text-border')} />
            ))}
          </div>
        </div>
      </div>

      {/* Reviewer */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
          {(review.reviewer_name || '?')[0].toUpperCase()}
        </div>
        <span className="text-xs font-medium">{review.reviewer_name}</span>
        <span className="text-[10px] text-muted-foreground ml-auto">
          {review.created_date ? formatDistanceToNow(new Date(review.created_date), { addSuffix: true }) : ''}
        </span>
      </div>

      {review.review_text && (
        <p className="text-sm text-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-3">{review.review_text}</p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 pt-1">
        <button
          onClick={() => onLike(review)}
          className={cn('flex items-center gap-1.5 text-xs transition-colors', hasLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-400')}
        >
          <Heart className={cn('w-3.5 h-3.5', hasLiked && 'fill-red-500')} />
          {review.likes || 0}
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Comments
        </button>
      </div>

      {showComments && (
        <CommentSection parentId={review.id} parentType="book_review" />
      )}
    </div>
  );
}